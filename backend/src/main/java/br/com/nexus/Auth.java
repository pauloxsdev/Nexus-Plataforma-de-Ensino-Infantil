package br.com.nexus;

import static br.com.nexus.ApiError.require;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class Auth extends OncePerRequestFilter {
  final JdbcTemplate db;
  final org.springframework.transaction.support.TransactionTemplate limits;
  final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(12);
  final String dummy;
  final String origin;
  final boolean secure;
  final int ipLimit;
  static final SecureRandom RANDOM = new SecureRandom();

  public Auth(
      JdbcTemplate db,
      org.springframework.transaction.PlatformTransactionManager transactions,
      @Value("${nexus.origin}") String origin,
      @Value("${nexus.secure-cookie}") boolean secure,
      @Value("${nexus.login-ip-limit:100}") int ipLimit) {
    this.db = db;
    limits = new org.springframework.transaction.support.TransactionTemplate(transactions);
    limits.setPropagationBehavior(
        org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    this.origin = origin;
    this.secure = secure;
    require(ipLimit >= 20 && ipLimit <= 10000, 500, "Limite de login inválido.");
    this.ipLimit = ipLimit;
    dummy = passwords.encode(token());
    var uri = java.net.URI.create(origin);
    boolean local = Set.of("localhost", "127.0.0.1").contains(uri.getHost());
    require(
        uri.getUserInfo() == null
            && (uri.getPath() == null || uri.getPath().isEmpty())
            && uri.getQuery() == null
            && uri.getFragment() == null,
        500,
        "APP_ORIGIN deve conter somente esquema, host e porta.");
    require(
        (secure && "https".equals(uri.getScheme()))
            || (!secure && local && "http".equals(uri.getScheme())),
        500,
        "HTTPS e SECURE_COOKIE obrigatórios fora do desenvolvimento local.");
  }

  static String token() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  static String hash(String s) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  record Identity(UUID id, String role, String csrf, String tokenHash) {}

  Identity identity(HttpServletRequest request) {
    String raw =
        Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
            .filter(c -> c.getName().equals("nexus_session"))
            .map(Cookie::getValue)
            .findFirst()
            .orElse("");
    if (raw.isEmpty()) return null;
    var rows =
        db.queryForList(
            "SELECT s.*, st.active FROM sessions s LEFT JOIN students st ON st.id=s.student_id"
                + " WHERE token_hash=? AND expires_at>now()",
            hash(raw));
    if (rows.isEmpty()) return null;
    var s = rows.getFirst();
    boolean teacher = s.get("teacher_id") != null;
    if (!teacher && !Boolean.TRUE.equals(s.get("active"))) return null;
    return new Identity(
        (UUID) s.get(teacher ? "teacher_id" : "student_id"),
        teacher ? "professor" : "aluno",
        (String) s.get("csrf"),
        hash(raw));
  }

  static Identity user(HttpServletRequest r, String role) {
    var u = (Identity) r.getAttribute("identity");
    require(u != null, 401, "Entre novamente para continuar.");
    require(role == null || role.equals(u.role()), 403, "Acesso não permitido.");
    return u;
  }

  void cookie(HttpServletResponse response, String value, long seconds) {
    response.addHeader(
        "Set-Cookie",
        ResponseCookie.from("nexus_session", value)
            .httpOnly(true)
            .secure(secure)
            .sameSite("Strict")
            .path("/api")
            .maxAge(seconds)
            .build()
            .toString());
  }

  Map<String, Object> login(UUID id, String role, HttpServletRequest req, HttpServletResponse res) {
    var old = identity(req);
    if (old != null) db.update("DELETE FROM sessions WHERE token_hash=?", old.tokenHash());
    String token = token(), csrf = token();
    db.update(
        "INSERT INTO sessions(token_hash,csrf,teacher_id,student_id,expires_at) VALUES"
            + " (?,?,?,?,now()+interval '8 hours')",
        hash(token),
        csrf,
        role.equals("professor") ? id : null,
        role.equals("aluno") ? id : null);
    cookie(res, token, 28800);
    return Map.of("id", id, "papel", role, "csrf", csrf);
  }

  void limit(String key) {
    int count =
        limits.execute(
            status ->
                db.queryForObject(
                    "INSERT INTO login_limits(key,attempts,expires_at) VALUES (?,1,now()+interval"
                        + " '5 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN"
                        + " login_limits.expires_at<now() THEN 1 ELSE login_limits.attempts+1 END,"
                        + " expires_at=CASE WHEN login_limits.expires_at<now() THEN now()+interval"
                        + " '5 minutes' ELSE login_limits.expires_at END RETURNING attempts",
                    Integer.class,
                    hash(key)));
    require(
        count <= (key.startsWith("ip:") ? ipLimit : 20),
        429,
        "Muitas tentativas. Aguarde cinco minutos.");
  }

  @Scheduled(fixedDelay = 3600000)
  void cleanup() {
    db.update("DELETE FROM sessions WHERE expires_at<now()");
    db.update("DELETE FROM login_limits WHERE expires_at<now()");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws java.io.IOException, ServletException {
    if (!req.getRequestURI().startsWith("/api/")) {
      chain.doFilter(req, res);
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    try {
      require(req.getContentLengthLong() <= 65536, 413, "Pedido muito grande.");
      if (!Set.of("GET", "HEAD").contains(req.getMethod())) {
        byte[] body = req.getInputStream().readNBytes(65537);
        require(body.length <= 65536, 413, "Pedido muito grande.");
        req =
            new HttpServletRequestWrapper(req) {
              @Override
              public ServletInputStream getInputStream() {
                var input = new java.io.ByteArrayInputStream(body);
                return new ServletInputStream() {
                  public int read() {
                    return input.read();
                  }

                  public boolean isFinished() {
                    return input.available() == 0;
                  }

                  public boolean isReady() {
                    return true;
                  }

                  public void setReadListener(ReadListener listener) {
                    throw new UnsupportedOperationException();
                  }
                };
              }
            };
      }
      var u = identity(req);
      req.setAttribute("identity", u);
      if (!Set.of("GET", "HEAD").contains(req.getMethod())) {
        require(
            origin.equals(req.getHeader("Origin")) && "1".equals(req.getHeader("X-Nexus-Request")),
            403,
            "Origem não permitida.");
        require(
            req.getContentType() != null && req.getContentType().startsWith("application/json"),
            415,
            "Envie JSON.");
        if (u != null)
          require(
              MessageDigest.isEqual(
                  u.csrf().getBytes(StandardCharsets.UTF_8),
                  Optional.ofNullable(req.getHeader("X-CSRF-Token"))
                      .orElse("")
                      .getBytes(StandardCharsets.UTF_8)),
              403,
              "Sessão inválida. Entre novamente.");
      }
      chain.doFilter(req, res);
    } catch (ApiError e) {
      res.setStatus(e.status);
      res.setContentType("application/json;charset=UTF-8");
      res.getWriter()
          .write(
              new com.fasterxml.jackson.databind.ObjectMapper()
                  .writeValueAsString(Map.of("erro", e.getMessage())));
    }
  }
}
