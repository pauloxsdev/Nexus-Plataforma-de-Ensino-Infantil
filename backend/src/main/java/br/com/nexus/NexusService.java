package br.com.nexus;

import static br.com.nexus.ApiError.require;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class NexusService {
  final JdbcTemplate db;
  final ObjectMapper json;
  final GameRules game;

  NexusService(JdbcTemplate db, ObjectMapper json, GameRules game) {
    this.db = db;
    this.json = json;
    this.game = game;
  }

  ObjectNode parse(Object value) {
    try {
      return (ObjectNode) json.readTree(value.toString());
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  Map<String, Object> classroom(UUID teacher, UUID classroom) {
    var rows =
        db.queryForList("SELECT * FROM classrooms WHERE id=? AND teacher_id=?", classroom, teacher);
    require(!rows.isEmpty(), 404, "Turma não encontrada.");
    return rows.getFirst();
  }

  Map<String, Object> student(UUID teacher, UUID id) {
    var rows =
        db.queryForList(
            "SELECT s.* FROM students s JOIN classrooms c ON c.id=s.classroom_id WHERE s.id=? AND"
                + " c.teacher_id=?",
            id,
            teacher);
    require(!rows.isEmpty(), 404, "Aluno não encontrado.");
    return rows.getFirst();
  }

  Map<String, Object> snapshot(UUID id) {
    var rows =
        db.queryForList(
            "SELECT s.*,c.timezone FROM students s JOIN classrooms c ON c.id=s.classroom_id WHERE"
                + " s.id=? AND s.active",
            id);
    require(!rows.isEmpty(), 401, "Entre novamente para continuar.");
    var row = rows.getFirst();
    return Map.of(
        "dados",
        parse(row.get("data")),
        "rotulo",
        row.get("label"),
        "fuso",
        row.get("timezone"),
        "totalFases",
        game.phases.size());
  }

  @Transactional
  Map<String, Object> event(UUID student, JsonNode event) {
    require(
        event.path("perfil").path("tipo").asText().equals("aluno")
            && event.path("perfil").path("id").asText().equals(student.toString()),
        403,
        "Evento de outro perfil.");
    UUID id = UUID.fromString(event.path("id").asText());
    String digest = Auth.hash(event.toString());
    var rows =
        db.queryForList(
            "SELECT s.*,c.timezone FROM students s JOIN classrooms c ON c.id=s.classroom_id WHERE"
                + " s.id=? AND s.active FOR UPDATE OF s",
            student);
    require(!rows.isEmpty(), 401, "Entre novamente para continuar.");
    var row = rows.getFirst();
    var existing =
        db.queryForList(
            "SELECT payload_hash,result FROM events WHERE student_id=? AND id=?", student, id);
    if (!existing.isEmpty()) {
      require(
          digest.equals(existing.getFirst().get("payload_hash")),
          409,
          "ID já utilizado por outro evento.");
      return Map.of(
          "confirmado", true, "id", id, "resultado", parse(existing.getFirst().get("result")));
    }
    var data = parse(row.get("data"));
    var result = json.createObjectNode();
    ZoneId zone = ZoneId.of(row.get("timezone").toString());
    LocalDate today = LocalDate.now(zone);
    switch (event.path("tipo").asText()) {
      case "tentativa" -> {
        int phaseId = event.path("faseId").asInt();
        var phase = game.phase(phaseId);
        require(
            phaseId == 1 || data.path("progresso").path("" + (phaseId - 1)).asInt() > 0,
            409,
            "Conclua a fase anterior antes de enviar esta tentativa.");
        var seconds = event.path("segundos");
        require(
            seconds.isIntegralNumber() && seconds.asInt() >= 0 && seconds.asInt() <= 604800,
            400,
            "Tempo inválido.");
        Instant occurred = Instant.parse(event.path("ocorridoEm").asText());
        Instant created = ((java.sql.Timestamp) row.get("created_at")).toInstant();
        require(
            !occurred.isAfter(Instant.now().plusSeconds(300))
                && !occurred.isBefore(created.minusSeconds(300)),
            400,
            "Data de atividade inválida.");
        var state = game.state(phase, event.path("estado"));
        var outcome = game.simulate(phase, state, seconds.asInt());
        if (outcome.activity()) {
          Set<String> days = new TreeSet<>();
          data.path("atividade").forEach(d -> days.add(d.asText()));
          days.add(occurred.atZone(zone).toLocalDate().toString());
          data.set("atividade", json.valueToTree(days));
        }
        if (outcome.success()) {
          var progress = game.object(data.path("progresso"));
          progress.put(
              "" + phaseId, Math.max(progress.path("" + phaseId).asInt(), outcome.stars()));
          data.set("progresso", progress);
        }
        // Replaying older offline activity can still earn the existing streak achievement.
        game.awards(data, occurred.atZone(zone).toLocalDate());
        result.put("concluida", outcome.success()).put("estrelas", outcome.stars());
      }
      case "dado" -> {
        String key = event.path("chave").asText();
        var value = event.path("valor");
        if (key.equals("avatar")) {
          game.validateAvatar(value);
          data.set(key, value);
        } else if (key.matches("circuito:trilha-principal:fase:[0-9]+")) {
          int phaseId = Integer.parseInt(key.substring(key.lastIndexOf(':') + 1));
          data.set(key, game.state(game.phase(phaseId), value));
        } else if (key.equals("conquistas")) {
          var c = game.object(data.path("conquistas"));
          Set<String> earned = new HashSet<>(), seen = new LinkedHashSet<>();
          c.path("ganhas").forEach(n -> earned.add(n.asText()));
          c.path("vistas").forEach(n -> seen.add(n.asText()));
          value
              .path("vistas")
              .forEach(
                  n -> {
                    if (earned.contains(n.asText())) seen.add(n.asText());
                  });
          c.set("vistas", json.valueToTree(seen));
          data.set(key, c);
        } else throw new ApiError(400, "Este dado só pode ser calculado pelo servidor.");
      }
      default -> throw new ApiError(400, "Tipo de evento inválido.");
    }
    game.awards(data, today);
    db.update("UPDATE students SET data=?::jsonb WHERE id=?", data.toString(), student);
    db.update(
        "INSERT INTO events(student_id,id,payload_hash,result) VALUES (?,?,?,?::jsonb)",
        student,
        id,
        digest,
        result.toString());
    return Map.of("confirmado", true, "id", id, "resultado", result);
  }

  List<Map<String, Object>> students(UUID teacher, UUID classroom) {
    var room = classroom(teacher, classroom);
    LocalDate today = LocalDate.now(ZoneId.of(room.get("timezone").toString()));
    return db
        .queryForList(
            "SELECT id,label,active,data FROM students WHERE classroom_id=? ORDER BY created_at,id",
            classroom)
        .stream()
        .map(
            row -> {
              var data = parse(row.remove("data"));
              var progress = game.object(data.path("progresso"));
              int completed = 0, stars = 0;
              for (var phase : game.phases) {
                int s = progress.path(phase.path("id").asText()).asInt();
                if (s > 0) {
                  completed++;
                  stars += s;
                }
              }
              Set<String> days = new TreeSet<>();
              data.path("atividade").forEach(d -> days.add(d.asText()));
              LocalDate cursor = days.contains(today.toString()) ? today : today.minusDays(1);
              int streak = 0;
              while (days.contains(cursor.toString())) {
                streak++;
                cursor = cursor.minusDays(1);
              }
              row.put("concluidas", completed);
              row.put("restantes", game.phases.size() - completed);
              row.put("totalFases", game.phases.size());
              row.put("estrelas", stars);
              row.put("diasAcumulados", days.size());
              row.put("diasConsecutivos", streak);
              row.put("progresso", progress);
              row.put("ultimaAtividade", days.isEmpty() ? "" : new TreeSet<>(days).last());
              return row;
            })
        .toList();
  }
}
