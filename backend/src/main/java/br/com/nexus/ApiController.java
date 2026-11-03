package br.com.nexus;

import static br.com.nexus.ApiError.require;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.*;
import java.time.ZoneId;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
class ApiController {
  final Auth auth;
  final NexusService service;

  ApiController(Auth auth, NexusService service) {
    this.auth = auth;
    this.service = service;
  }

  @GetMapping("/health")
  Object health() {
    auth.db.queryForObject("SELECT 1", Integer.class);
    return Map.of("status", "ok");
  }

  @GetMapping("/session")
  Object session(HttpServletRequest req) {
    var u = Auth.user(req, null);
    return Map.of("id", u.id(), "papel", u.role(), "csrf", u.csrf());
  }

  @PostMapping("/auth/professor")
  Object teacherLogin(@RequestBody JsonNode body, HttpServletRequest req, HttpServletResponse res) {
    String login = body.path("login").asText().trim().toLowerCase(Locale.ROOT),
        password = body.path("senha").asText();
    require(
        login.length() <= 80
            && password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72,
        400,
        "Credenciais inválidas.");
    auth.limit("ip:" + req.getRemoteAddr());
    auth.limit("teacher:" + login);
    var rows = auth.db.queryForList("SELECT id,password_hash FROM teachers WHERE login=?", login);
    boolean valid =
        auth.passwords.matches(
            password,
            rows.isEmpty() ? auth.dummy : rows.getFirst().get("password_hash").toString());
    require(valid && !rows.isEmpty(), 401, "Credenciais inválidas.");
    return auth.login((UUID) rows.getFirst().get("id"), "professor", req, res);
  }

  @PostMapping("/auth/aluno")
  Object studentLogin(@RequestBody JsonNode body, HttpServletRequest req, HttpServletResponse res) {
    auth.limit("ip:" + req.getRemoteAddr());
    String code =
        body.path("codigo").asText().replace("-", "").replace(" ", "").toUpperCase(Locale.ROOT);
    require(code.matches("[0-9A-F]{32}"), 401, "Código inválido ou desativado.");
    var rows =
        auth.db.queryForList(
            "SELECT id FROM students WHERE code_hash=? AND active", Auth.hash(code));
    require(!rows.isEmpty(), 401, "Código inválido ou desativado.");
    return auth.login((UUID) rows.getFirst().get("id"), "aluno", req, res);
  }

  @PostMapping("/auth/logout")
  Object logout(HttpServletRequest req, HttpServletResponse res) {
    var u = Auth.user(req, null);
    auth.db.update("DELETE FROM sessions WHERE token_hash=?", u.tokenHash());
    auth.cookie(res, "", 0);
    return Map.of("ok", true);
  }

  @PostMapping("/auth/password")
  @Transactional
  Object password(@RequestBody JsonNode body, HttpServletRequest req, HttpServletResponse res) {
    var u = Auth.user(req, "professor");
    String current = body.path("atual").asText(), next = body.path("nova").asText();
    auth.limit("password:" + u.id());
    require(
        current.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72,
        400,
        "Senha atual inválida.");
    require(
        next.length() >= 12 && next.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72,
        400,
        "Use pelo menos 12 caracteres e no máximo 72 bytes.");
    require(
        auth.passwords.matches(
            current,
            auth.db.queryForObject(
                "SELECT password_hash FROM teachers WHERE id=?", String.class, u.id())),
        401,
        "Senha atual inválida.");
    auth.db.update(
        "UPDATE teachers SET password_hash=? WHERE id=?", auth.passwords.encode(next), u.id());
    auth.db.update("DELETE FROM sessions WHERE teacher_id=?", u.id());
    auth.cookie(res, "", 0);
    return Map.of("ok", true);
  }

  @GetMapping("/turmas")
  Object classes(HttpServletRequest req) {
    var u = Auth.user(req, "professor");
    return auth.db.queryForList(
        "SELECT id,name,timezone FROM classrooms WHERE teacher_id=? ORDER BY created_at,id",
        u.id());
  }

  @PostMapping("/turmas")
  Object create(@RequestBody JsonNode body, HttpServletRequest req) {
    var u = Auth.user(req, "professor");
    String name = body.path("nome").asText().trim(),
        zone = body.path("fuso").asText("America/Sao_Paulo");
    require(
        !name.isEmpty() && name.length() <= 80,
        400,
        "Informe um nome de turma com até 80 caracteres.");
    ZoneId.of(zone);
    UUID id = UUID.randomUUID();
    auth.db.update(
        "INSERT INTO classrooms(id,teacher_id,name,timezone) VALUES (?,?,?,?)",
        id,
        u.id(),
        name,
        zone);
    return Map.of("id", id, "name", name, "timezone", zone);
  }

  @DeleteMapping("/turmas/{id}")
  Object deleteClass(@PathVariable UUID id, HttpServletRequest req) {
    var u = Auth.user(req, "professor");
    service.classroom(u.id(), id);
    auth.db.update("DELETE FROM classrooms WHERE id=? AND teacher_id=?", id, u.id());
    return Map.of("ok", true);
  }

  @GetMapping("/turmas/{id}/alunos")
  Object listStudents(@PathVariable UUID id, HttpServletRequest req) {
    return service.students(Auth.user(req, "professor").id(), id);
  }

  static String code() {
    byte[] bytes = new byte[16];
    Auth.RANDOM.nextBytes(bytes);
    return HexFormat.of().withUpperCase().formatHex(bytes);
  }

  @PostMapping("/turmas/{id}/alunos")
  Object addStudent(@PathVariable UUID id, HttpServletRequest req) {
    service.classroom(Auth.user(req, "professor").id(), id);
    UUID student = UUID.randomUUID();
    String code = code(), label = "Aluno " + student.toString().substring(0, 8);
    auth.db.update(
        "INSERT INTO students(id,classroom_id,label,code_hash) VALUES (?,?,?,?)",
        student,
        id,
        label,
        Auth.hash(code));
    return Map.of("id", student, "rotulo", label, "codigo", code);
  }

  @PostMapping("/alunos/{id}/codigo")
  @Transactional
  Object rotate(@PathVariable UUID id, HttpServletRequest req) {
    service.student(Auth.user(req, "professor").id(), id);
    String code = code();
    auth.db.update("UPDATE students SET code_hash=? WHERE id=?", Auth.hash(code), id);
    auth.db.update("DELETE FROM sessions WHERE student_id=?", id);
    return Map.of("codigo", code);
  }

  @PatchMapping("/alunos/{id}")
  @Transactional
  Object active(@PathVariable UUID id, @RequestBody JsonNode body, HttpServletRequest req) {
    service.student(Auth.user(req, "professor").id(), id);
    require(body.path("ativo").isBoolean(), 400, "Estado inválido.");
    auth.db.update("UPDATE students SET active=? WHERE id=?", body.path("ativo").asBoolean(), id);
    auth.db.update("DELETE FROM sessions WHERE student_id=?", id);
    return Map.of("ok", true);
  }

  @DeleteMapping("/alunos/{id}")
  Object deleteStudent(@PathVariable UUID id, HttpServletRequest req) {
    service.student(Auth.user(req, "professor").id(), id);
    auth.db.update("DELETE FROM students WHERE id=?", id);
    return Map.of("ok", true);
  }

  @GetMapping("/aluno/estado")
  Object snapshot(HttpServletRequest req) {
    return service.snapshot(Auth.user(req, "aluno").id());
  }

  @PostMapping("/aluno/eventos")
  Object event(@RequestBody JsonNode body, HttpServletRequest req) {
    return service.event(Auth.user(req, "aluno").id(), body);
  }
}
