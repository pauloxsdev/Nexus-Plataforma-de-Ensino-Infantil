package br.com.nexus;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;

class GameRulesTest {
  @Test
  void matchesFrontendAcross640Circuits() throws Exception {
    var json = new ObjectMapper();
    var rules = new GameRules(json);
    try (var in = getClass().getResourceAsStream("/game-fixtures.json")) {
      for (var sample : json.readTree(in)) {
        var phase = rules.phase(sample.path("faseId").asInt());
        var result =
            rules.simulate(
                phase, rules.state(phase, sample.path("estado")), sample.path("segundos").asInt());
        assertEquals(sample.path("activity").asBoolean(), result.activity(), sample.toString());
        assertEquals(sample.path("success").asBoolean(), result.success(), sample.toString());
        assertEquals(sample.path("stars").asInt(), result.stars(), sample.toString());
        assertEquals(sample.path("steps").asInt(), result.steps(), sample.toString());
      }
    }
  }
}
