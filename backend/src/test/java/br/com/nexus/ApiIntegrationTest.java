package br.com.nexus;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest
@AutoConfigureMockMvc(
    print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class ApiIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired Auth auth;
  @Autowired ObjectMapper json;
  @Autowired NexusService service;
  @Autowired GameRules game;
  static final String PASSWORD = "Uma-senha-de-teste-123";

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry p) {
    String url = System.getenv("TEST_DATABASE_URL");
    if (url == null || !url.endsWith("/nexus_test"))
      throw new IllegalStateException(
          "Use TEST_DATABASE_URL apontando ao banco descartável nexus_test.");
    p.add("spring.datasource.url", () -> url);
    p.add("spring.datasource.username", () -> "nexus");
    p.add("spring.datasource.password", () -> System.getenv("TEST_DATABASE_PASSWORD"));
    p.add("nexus.login-ip-limit", () -> 20);
    p.add("nexus.origin", () -> "http://localhost:5173");
  }

  @BeforeEach
  void setup() {
    auth.db.execute("TRUNCATE teachers,login_limits CASCADE");
    for (String name : List.of("prof1", "prof2"))
      auth.db.update(
          "INSERT INTO teachers(id,login,password_hash) VALUES (?,?,?)",
          UUID.randomUUID(),
          name,
          auth.passwords.encode(PASSWORD));
  }

  record Session(Cookie cookie, String csrf, String id) {}

  MvcResult call(String method, String path, Object body, Session session, int status)
      throws Exception {
    var request =
        MockMvcRequestBuilders.request(HttpMethod.valueOf(method), "/api" + path)
            .header("Origin", "http://localhost:5173")
            .header("X-Nexus-Request", "1")
            .contentType("application/json");
    if (body != null) request.content(json.writeValueAsString(body));
    if (session != null) request.cookie(session.cookie()).header("X-CSRF-Token", session.csrf());
    var result = mvc.perform(request).andReturn();
    assertEquals(
        status, result.getResponse().getStatus(), result.getResponse().getContentAsString());
    return result;
  }

  JsonNode body(MvcResult r) throws Exception {
    return json.readTree(r.getResponse().getContentAsString());
  }

  Session login(String role, Object payload) throws Exception {
    var response = call("POST", "/auth/" + role, payload, null, 200);
    var b = body(response);
    String cookie =
        response.getResponse().getHeader("Set-Cookie").split(";", 2)[0].split("=", 2)[1];
    return new Session(
        new Cookie("nexus_session", cookie), b.path("csrf").asText(), b.path("id").asText());
  }

  Session teacher(String login) throws Exception {
    return login("professor", Map.of("login", login, "senha", PASSWORD));
  }

  JsonNode createStudent(Session teacher) throws Exception {
    var room =
        body(
            call(
                "POST",
                "/turmas",
                Map.of("nome", "Turma teste", "fuso", "America/Sao_Paulo"),
                teacher,
                200));
    var student =
        body(
            call(
                "POST", "/turmas/" + room.path("id").asText() + "/alunos", Map.of(), teacher, 200));
    ((ObjectNode) student).put("turma", room.path("id").asText());
    return student;
  }

  Session student(JsonNode row) throws Exception {
    return login("aluno", Map.of("codigo", row.path("codigo").asText()));
  }

  ObjectNode attempt(Session student) {
    var e = json.createObjectNode();
    e.put("id", UUID.randomUUID().toString())
        .put("tipo", "tentativa")
        .put("faseId", 1)
        .put("segundos", 10)
        .put("ocorridoEm", Instant.now().toString());
    e.set("perfil", json.valueToTree(Map.of("tipo", "aluno", "id", student.id())));
    e.set(
        "estado",
        json.valueToTree(
            Map.of("slots", Map.of("a", "andar", "b", "andar", "c", "andar"), "vezes", Map.of())));
    return e;
  }

  @Test
  void deniesAnonymousAndCrossRoleRequests() throws Exception {
    call("GET", "/turmas", null, null, 401);
    var t = teacher("prof1");
    var s = student(createStudent(t));
    call("GET", "/turmas", null, s, 403);
    call("GET", "/aluno/estado", null, t, 403);
  }

  @Test
  void isolatesTeachersAndStudentEvents() throws Exception {
    var a = teacher("prof1");
    var b = teacher("prof2");
    var row = createStudent(a);
    var s = student(row);
    call("GET", "/turmas/" + row.path("turma").asText() + "/alunos", null, b, 404);
    call("POST", "/alunos/" + s.id() + "/codigo", Map.of(), b, 404);
    var wrong = attempt(s);
    ((ObjectNode) wrong.path("perfil")).put("id", UUID.randomUUID().toString());
    call("POST", "/aluno/eventos", wrong, s, 403);
    var other = student(createStudent(b));
    assertTrue(body(call("GET", "/aluno/estado", null, other, 200)).path("dados").isEmpty());
  }

  @Test
  void validatesResultsAndDeduplicatesWithoutLosingBestScore() throws Exception {
    var t = teacher("prof1");
    var row = createStudent(t);
    var s = student(row);
    var e = attempt(s);
    call("POST", "/aluno/eventos", e, s, 200);
    call("POST", "/aluno/eventos", e, s, 200);
    assertEquals(1, auth.db.queryForObject("SELECT count(*) FROM events", Integer.class));
    var replay = attempt(s).put("segundos", 200);
    call("POST", "/aluno/eventos", replay, s, 200);
    var data = body(call("GET", "/aluno/estado", null, s, 200)).path("dados");
    assertEquals(3, data.path("progresso").path("1").asInt());
    assertEquals(1, data.path("atividade").size());
    assertEquals(2, data.path("conquistas").path("ganhas").size());
    var dashboard =
        body(call("GET", "/turmas/" + row.path("turma").asText() + "/alunos", null, t, 200));
    assertEquals(1, dashboard.get(0).path("concluidas").asInt());
    assertEquals(game.phases.size() - 1, dashboard.get(0).path("restantes").asInt());
    e.put("segundos", 400);
    call("POST", "/aluno/eventos", e, s, 409);
    var reopened = student(row);
    assertEquals(
        3,
        body(call("GET", "/aluno/estado", null, reopened, 200))
            .path("dados")
            .path("progresso")
            .path("1")
            .asInt());
  }

  @Test
  void rejectsFakeProgressUnknownPiecesFutureDatesAndLockedPhases() throws Exception {
    var s = student(createStudent(teacher("prof1")));
    var e = attempt(s).put("faseId", 8);
    call("POST", "/aluno/eventos", e, s, 409);
    e = attempt(s).put("ocorridoEm", Instant.now().plusSeconds(600).toString());
    call("POST", "/aluno/eventos", e, s, 400);
    e = attempt(s);
    ((ObjectNode) e.path("estado").path("slots")).put("a", "teletransporte");
    call("POST", "/aluno/eventos", e, s, 400);
    e = attempt(s).put("tipo", "dado").put("chave", "progresso");
    e.set("valor", json.valueToTree(Map.of("8", 3)));
    call("POST", "/aluno/eventos", e, s, 400);
    e = attempt(s);
    ((ObjectNode) e.path("estado")).set("slots", json.createObjectNode());
    call("POST", "/aluno/eventos", e, s, 200);
    var d = body(call("GET", "/aluno/estado", null, s, 200)).path("dados");
    assertTrue(d.path("progresso").isMissingNode());
    assertTrue(d.path("atividade").isMissingNode());
  }

  @Test
  void revokesCodesSessionsAndDeletedRecords() throws Exception {
    var t = teacher("prof1");
    var row = createStudent(t);
    var s = student(row);
    call("POST", "/alunos/" + s.id() + "/codigo", Map.of(), t, 200);
    call("GET", "/aluno/estado", null, s, 401);
    call("POST", "/auth/aluno", Map.of("codigo", row.path("codigo").asText()), null, 401);
    call("DELETE", "/turmas/" + row.path("turma").asText(), Map.of(), t, 200);
    assertEquals(0, auth.db.queryForObject("SELECT count(*) FROM students", Integer.class));
  }

  @Test
  void csrfAndLogoutAreEnforced() throws Exception {
    var t = teacher("prof1");
    var r =
        mvc.perform(
                MockMvcRequestBuilders.post("/api/turmas")
                    .cookie(t.cookie())
                    .contentType("application/json")
                    .content("{\"nome\":\"Ataque\"}"))
            .andReturn();
    assertEquals(403, r.getResponse().getStatus());
    var forged = new Session(t.cookie(), "invalid", t.id());
    call("POST", "/turmas", Map.of("nome", "X"), forged, 403);
    call("POST", "/auth/logout", Map.of(), t, 200);
    call("GET", "/turmas", null, t, 401);
  }

  @Test
  void failedLoginIsRateLimited() throws Exception {
    for (int i = 0; i < 20; i++)
      call("POST", "/auth/aluno", Map.of("codigo", "invalid"), null, 401);
    call("POST", "/auth/aluno", Map.of("codigo", "invalid"), null, 429);
  }

  @Test
  void passwordChangeRevokesAllTeacherSessions() throws Exception {
    var first = teacher("prof1");
    var second = teacher("prof1");
    call(
        "POST",
        "/auth/password",
        Map.of("atual", PASSWORD, "nova", "Senha-nova-muito-longa-456"),
        first,
        200);
    call("GET", "/turmas", null, second, 401);
    login("professor", Map.of("login", "prof1", "senha", "Senha-nova-muito-longa-456"));
  }

  @Test
  void persistsAvatarDraftAndFiltersUnawardedAchievements() throws Exception {
    var s = student(createStudent(teacher("prof1")));
    var e = attempt(s).put("tipo", "dado").put("chave", "avatar");
    var avatar = game.defaultAvatar().put("forma", "gota");
    e.set("valor", avatar);
    call("POST", "/aluno/eventos", e, s, 200);
    e = attempt(s).put("tipo", "dado").put("chave", "circuito:trilha-principal:fase:1");
    e.set("valor", e.path("estado"));
    call("POST", "/aluno/eventos", e, s, 200);
    e = attempt(s).put("tipo", "dado").put("chave", "conquistas");
    e.set(
        "valor",
        json.valueToTree(
            Map.of("ganhas", List.of("completa"), "vistas", List.of("completa", "meunexus"))));
    call("POST", "/aluno/eventos", e, s, 200);
    var d = body(call("GET", "/aluno/estado", null, s, 200)).path("dados");
    assertEquals("gota", d.path("avatar").path("forma").asText());
    assertEquals(3, d.path("circuito:trilha-principal:fase:1").path("slots").size());
    assertEquals(
        List.of("meunexus"), json.convertValue(d.path("conquistas").path("ganhas"), List.class));
    assertEquals(
        List.of("meunexus"), json.convertValue(d.path("conquistas").path("vistas"), List.class));
  }

  @Test
  void activitiesRespectClassTimezoneAndSequenceGaps() throws Exception {
    var t = teacher("prof1");
    var row = createStudent(t);
    var s = student(row);
    auth.db.update(
        "UPDATE students SET created_at=now()-interval '30 days' WHERE id=?",
        UUID.fromString(s.id()));
    var zone = java.time.ZoneId.of("America/Sao_Paulo");
    var today = java.time.LocalDate.now(zone);
    for (int ago : List.of(3, 2, 0)) {
      var e =
          attempt(s)
              .put("ocorridoEm", today.minusDays(ago).atStartOfDay(zone).toInstant().toString());
      call("POST", "/aluno/eventos", e, s, 200);
    }
    var d =
        body(call("GET", "/turmas/" + row.path("turma").asText() + "/alunos", null, t, 200)).get(0);
    assertEquals(3, d.path("diasAcumulados").asInt());
    assertEquals(1, d.path("diasConsecutivos").asInt());
  }

  @Test
  void emptyStudentHasObjectProgressAndCanBeDeactivated() throws Exception {
    var t = teacher("prof1");
    var row = createStudent(t);
    var s = student(row);
    var list = body(call("GET", "/turmas/" + row.path("turma").asText() + "/alunos", null, t, 200));
    assertTrue(list.get(0).path("progresso").isObject());
    assertEquals(0, list.get(0).path("concluidas").asInt());
    call("PATCH", "/alunos/" + s.id(), Map.of("ativo", false), t, 200);
    call("GET", "/aluno/estado", null, s, 401);
    call("POST", "/auth/aluno", Map.of("codigo", row.path("codigo").asText()), null, 401);
    call("PATCH", "/alunos/" + s.id(), Map.of("ativo", true), t, 200);
    student(row);
  }

  @Test
  void concurrentRetriesCommitOnlyOnce() throws Exception {
    var s = student(createStudent(teacher("prof1")));
    var e = attempt(s);
    try (var pool = java.util.concurrent.Executors.newFixedThreadPool(4)) {
      var tasks = new java.util.ArrayList<java.util.concurrent.Callable<MvcResult>>();
      for (int i = 0; i < 4; i++) tasks.add(() -> call("POST", "/aluno/eventos", e, s, 200));
      for (var result : pool.invokeAll(tasks)) result.get();
    }
    assertEquals(1, auth.db.queryForObject("SELECT count(*) FROM events", Integer.class));
  }

  @Test
  void failedPasswordChangeStillCountsAndExpiredSessionIsRejected() throws Exception {
    var t = teacher("prof1");
    call(
        "POST",
        "/auth/password",
        Map.of("atual", "errada", "nova", "Nova-senha-valida-123"),
        t,
        401);
    assertEquals(
        1,
        auth.db.queryForObject(
            "SELECT attempts FROM login_limits WHERE key=?",
            Integer.class,
            Auth.hash("password:" + t.id())));
    auth.db.update(
        "UPDATE sessions SET expires_at=now()-interval '1 second' WHERE teacher_id=?",
        UUID.fromString(t.id()));
    call("GET", "/turmas", null, t, 401);
    call("POST", "/auth/professor", Map.of("login", "prof1", "senha", "é".repeat(50)), null, 400);
  }
}
