package br.com.nexus;

import static br.com.nexus.ApiError.require;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
class GameRules {
  final ObjectMapper json;
  final JsonNode phases;
  final JsonNode phasesV1, phasesV2;
  final JsonNode cosmetics;

  GameRules(ObjectMapper json) throws java.io.IOException {
    this.json = json;
    try (var in = getClass().getResourceAsStream("/fases.json")) {
      phases = json.readTree(in);
    }
    try (var in = getClass().getResourceAsStream("/fases-v1.json")) {
      phasesV1 = json.readTree(in);
    }
    try (var in = getClass().getResourceAsStream("/fases-v2.json")) {
      phasesV2 = json.readTree(in);
    }
    try (var in = getClass().getResourceAsStream("/personalizacao.json")) {
      cosmetics = json.readTree(in);
    }
  }

  JsonNode phase(int id) {
    for (var f : phases) if (f.path("id").asInt() == id) return f;
    throw new ApiError(400, "Fase inválida.");
  }

  // Unversioned payloads were produced by the original client. Never rewrite
  // their IDs or contents: they may already have reached the idempotent endpoint.
  JsonNode phaseForState(int id, JsonNode state) {
    var version = state.path("versaoRegras");
    require(!state.has("versaoRegras")
        || (version.isIntegralNumber() && version.canConvertToInt()
            && (version.asInt() == 1 || version.asInt() == 2)),
        400, "Versão de regras desconhecida.");
    var catalog = version.asInt(1) == 1 ? phasesV1 : phasesV2;
    for (var phase : catalog) if (phase.path("id").asInt() == id) return phase;
    throw new ApiError(400, "Fase inválida.");
  }

  ObjectNode object(JsonNode n) {
    return n instanceof ObjectNode o ? o : json.createObjectNode();
  }

  ObjectNode state(JsonNode phase, JsonNode value) {
    require(
        value.isObject() && value.path("slots").isObject() && value.path("vezes").isObject(),
        400,
        "Circuito inválido.");
    var slots = json.createObjectNode();
    var loops = json.createObjectNode();
    visit(circuit(phase, value), phase.path("pecas"), value, slots, loops);
    require(
        value.path("slots").size() == slots.size() && value.path("vezes").size() == loops.size(),
        400,
        "Espaços ou repetições desconhecidos.");
    var out = json.createObjectNode();
    out.set("slots", slots);
    out.set("vezes", loops);
    if (value.has("estrutura")) out.set("estrutura", value.get("estrutura"));
    if (value.has("versaoRegras")) out.set("versaoRegras", value.get("versaoRegras"));
    return out;
  }

  JsonNode circuit(JsonNode phase, JsonNode state) {
    if (!state.has("estrutura")) return phase.path("circuito");
    for (var option : phase.path("alternativas"))
      if (option.path("id").asText().equals(state.path("estrutura").asText())) return option.path("circuito");
    throw new ApiError(400, "Estrutura de programa inválida.");
  }

  int pieces(JsonNode nodes, JsonNode state) {
    int count = 0;
    for (var n : nodes) {
      String type = n.path("tipo").asText();
      if (type.equals("espaco") && (n.has("fixo") || state.path("slots").has(n.path("id").asText()))) count++;
      if (type.equals("repetir")) count += pieces(n.path("dentro"), state);
      if (type.equals("se")) count += pieces(n.path("sim"), state) + pieces(n.path("nao"), state);
    }
    return count;
  }

  void visit(JsonNode nodes, JsonNode pieces, JsonNode value, ObjectNode slots, ObjectNode loops) {
    for (var n : nodes) {
      String id = n.path("id").asText();
      switch (n.path("tipo").asText()) {
        case "espaco" -> {
          if (value.path("slots").has(id)) {
            var piece = value.path("slots").get(id);
            boolean allowed = false;
            for (var p : pieces) if (p.equals(piece)) allowed = true;
            require(allowed && !n.has("fixo"), 400, "Peça inválida.");
            slots.set(id, piece);
          }
        }
        case "repetir" -> {
          var count = value.path("vezes").path(id);
          require(
              count.isIntegralNumber()
                  && count.asInt() >= 1
                  && count.asInt() <= n.path("max").asInt(),
              400,
              "Repetição inválida.");
          loops.set(id, count);
          visit(n.path("dentro"), pieces, value, slots, loops);
        }
        case "se" -> {
          visit(n.path("sim"), pieces, value, slots, loops);
          visit(n.path("nao"), pieces, value, slots, loops);
        }
      }
    }
  }

  record Result(boolean activity, boolean success, int stars, int steps) {}

  Result simulate(JsonNode phase, JsonNode state, int seconds) {
    var nodes = circuit(phase, state);
    var run = new Run(phase, state);
    run.activity = run.hasAction(nodes);
    run.run(nodes);
    boolean success =
        !run.failed
            && run.collected.size() == phase.path("mundo").path("estrelas").size()
            && run.activity;
    // Archived v1 attempts keep their original time-based rule. Current
    // attempts reward written action pieces, independent of exploration time.
    boolean extra = phase.path("ideal").has("segundos")
        ? seconds <= phase.path("ideal").path("segundos").asInt()
        : pieces(nodes, state) <= phase.path("ideal").path("pecas").asInt();
    int stars =
        success
            ? 1
                + (run.steps <= phase.path("ideal").path("passos").asInt() ? 1 : 0)
                + (extra ? 1 : 0)
            : 0;
    return new Result(run.activity, success, stars, run.steps);
  }

  static class Run {
    final JsonNode world, state;
    int x, y, dir, steps, operations;
    boolean failed, activity;
    Set<String> collected = new HashSet<>();
    final int[] dx = {0, 1, 0, -1}, dy = {-1, 0, 1, 0};

    Run(JsonNode phase, JsonNode state) {
      world = phase.path("mundo");
      this.state = state;
      x = world.path("inicio").path("x").asInt();
      y = world.path("inicio").path("y").asInt();
      dir = List.of("N", "E", "S", "W").indexOf(world.path("inicio").path("dir").asText());
    }

    boolean hasAction(JsonNode nodes) {
      for (var n : nodes) {
        String type = n.path("tipo").asText();
        if (type.equals("espaco")
            && (n.has("fixo") || state.path("slots").has(n.path("id").asText()))) return true;
        if (type.equals("repetir") && hasAction(n.path("dentro"))) return true;
        if (type.equals("se") && (hasAction(n.path("sim")) || hasAction(n.path("nao"))))
          return true;
      }
      return false;
    }

    boolean contains(JsonNode list, int a, int b) {
      for (var pos : list) if (pos.get(0).asInt() == a && pos.get(1).asInt() == b) return true;
      return false;
    }

    boolean blocked(int a, int b) {
      return a < 0
          || b < 0
          || a >= world.path("w").asInt()
          || b >= world.path("h").asInt()
          || contains(world.path("pedras"), a, b)
          || contains(world.path("lavas"), a, b);
    }

    void run(JsonNode nodes) {
      for (var n : nodes) {
        if (failed) return;
        String type = n.path("tipo").asText(), id = n.path("id").asText();
        String piece =
            n.has("fixo") ? n.path("fixo").asText() : state.path("slots").path(id).asText("");
        if (type.equals("espaco") && piece.isEmpty()) continue;
        if (++operations > 300) {
          failed = true;
          return;
        }
        if (type.equals("repetir")) {
          for (int i = 0; i < state.path("vezes").path(id).asInt() && !failed; i++)
            run(n.path("dentro"));
        } else if (type.equals("se"))
          run(n.path(blocked(x + dx[dir], y + dy[dir]) ? "sim" : "nao"));
        else if (type.equals("espaco")) {
          if (piece.equals("virar_dir")) dir = (dir + 1) % 4;
          else if (piece.equals("virar_esq")) dir = (dir + 3) % 4;
          else {
            int distance = piece.equals("pular") ? 2 : 1;
            int a = x + dx[dir] * distance, b = y + dy[dir] * distance;
            if (blocked(a, b)) {
              failed = true;
              return;
            }
            x = a;
            y = b;
          }
          steps++;
          if (contains(world.path("estrelas"), x, y)) collected.add(x + "," + y);
        }
      }
    }
  }

  void awards(ObjectNode data, LocalDate day) {
    var progress = data.path("progresso");
    Set<Integer> done = new HashSet<>();
    int stars = 0, three = 0;
    for (var p : phases) {
      int id = p.path("id").asInt(), s = progress.path("" + id).asInt();
      if (s > 0) {
        done.add(id);
        stars += s;
        if (s == 3) three++;
      }
    }
    Set<String> dates = new HashSet<>();
    data.path("atividade").forEach(d -> dates.add(d.asText()));
    LocalDate cursor = dates.contains(day.toString()) ? day : day.minusDays(1);
    int streak = 0;
    while (dates.contains(cursor.toString())) {
      streak++;
      cursor = cursor.minusDays(1);
    }
    Set<String> earned = new LinkedHashSet<>();
    data.path("conquistas").path("ganhas").forEach(n -> earned.add(n.asText()));
    if (done.contains(1)) earned.add("primeira");
    if (data.has("avatar") && !data.get("avatar").equals(defaultAvatar())) earned.add("meunexus");
    if (done.containsAll(List.of(1, 2, 3))) earned.add("sequencia");
    if (streak >= 7) earned.add("fogo");
    if (stars >= 5) earned.add("caca1");
    if (stars >= 12) earned.add("caca2");
    if (stars >= 20) earned.add("caca3");
    if (done.size() >= (phases.size() + 1) / 2) earned.add("meio");
    if (done.size() == phases.size()) earned.add("completa");
    if (done.containsAll(List.of(4, 5))) earned.add("loop");
    if (done.containsAll(List.of(6, 7))) earned.add("decisao");
    if (done.contains(8)) earned.add("regra");
    if (three >= 1) earned.add("perfeito");
    if (three >= 4) earned.add("colecionador");
    var c = object(data.path("conquistas"));
    c.set("ganhas", json.valueToTree(earned));
    if (!c.has("vistas")) c.putArray("vistas");
    data.set("conquistas", c);
  }

  ObjectNode defaultAvatar() {
    return json.createObjectNode()
        .put("forma", "orbe")
        .put("cor", "#FFD60A")
        .put("rosto", "feliz")
        .put("acc", "nenhum");
  }

  ObjectNode validateAvatar(JsonNode v, JsonNode progress) {
    require(v.isObject() && v.size() == 4, 400, "Avatar inválido.");
    int completed = 0, stars = 0;
    for (var phase : phases) {
      var value = progress.path(phase.path("id").asText());
      int score = value.asInt();
      if (value.isIntegralNumber() && score >= 1 && score <= 3) { completed++; stars += score; }
    }
    var available = json.createObjectNode();
    var fields = cosmetics.fields();
    while (fields.hasNext()) {
      var field = fields.next();
      JsonNode selected = null;
      for (var item : field.getValue()) {
        if (item.path("id").asText().equals(v.path(field.getKey()).asText())) selected = item;
      }
      require(selected != null, 400, "Avatar inválido.");
      boolean unlocked = completed >= selected.path("fases").asInt()
          && stars >= selected.path("estrelas").asInt()
          && (!selected.path("trilha").asBoolean() || completed == phases.size())
          && (!selected.path("perfeita").asBoolean() || stars == phases.size() * 3);
      // Old clients may have queued cosmetics before unlocks existed. Keep the queue
      // moving, but only persist items earned from server-validated progress.
      available.put(field.getKey(), (unlocked ? selected : field.getValue().get(0)).path("id").asText());
    }
    return available;
  }
}
