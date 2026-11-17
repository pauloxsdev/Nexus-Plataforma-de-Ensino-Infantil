package br.com.nexus;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;

class GameRulesTest {
  @Test
  void matchesFrontendAcross640Circuits() throws Exception {
    matchesFixtures("/game-fixtures.json");
  }

  @Test
  void retains640OriginalCircuits() throws Exception {
    matchesFixtures("/game-fixtures-v1.json");
  }

  void matchesFixtures(String path) throws Exception {
    var json = new ObjectMapper();
    var rules = new GameRules(json);
    try (var in = getClass().getResourceAsStream(path)) {
      for (var sample : json.readTree(in)) {
        var phase = rules.phaseForState(sample.path("faseId").asInt(), sample.path("estado"));
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

  @Test
  void bothConditionalBranchesAreNeeded() throws Exception {
    var json = new ObjectMapper(); var rules = new GameRules(json); var phase = rules.phaseForState(6, json.createObjectNode().put("versaoRegras", 2));
    var correct = json.readTree("{\"slots\":{\"a\":\"pular\",\"b\":\"andar\"},\"vezes\":{\"r\":3}}");
    assertTrue(rules.simulate(phase, rules.state(phase, correct), 900).success());
    for (String slots : new String[]{"{\"a\":\"pular\"}", "{\"a\":\"pular\",\"b\":\"pular\"}"}) {
      var wrong = json.readTree("{\"slots\":" + slots + ",\"vezes\":{\"r\":3}}");
      assertFalse(rules.simulate(phase, rules.state(phase, wrong), 1).success());
    }
  }

  @Test
  void strategiesAreValidatedAndTimeDoesNotReduceStars() throws Exception {
    var json = new ObjectMapper(); var rules = new GameRules(json); var phase = rules.phaseForState(4, json.createObjectNode().put("versaoRegras", 2));
    var loop = rules.state(phase, json.readTree("{\"slots\":{\"a\":\"andar\"},\"vezes\":{\"r\":4}}"));
    assertEquals(3, rules.simulate(phase, loop, 86400).stars());
    var sequence = rules.state(phase, json.readTree("{\"estrutura\":\"sequencia\",\"slots\":{\"livre1\":\"andar\",\"livre2\":\"andar\",\"livre3\":\"andar\",\"livre4\":\"andar\"},\"vezes\":{}}"));
    assertEquals("sequencia", sequence.path("estrutura").asText());
    assertEquals(2, rules.simulate(phase, sequence, 0).stars());
    ((com.fasterxml.jackson.databind.node.ObjectNode) sequence).put("estrutura", "arbitraria");
    assertThrows(ApiError.class, () -> rules.state(phase, sequence));
    assertThrows(ApiError.class, () -> rules.state(phase, json.readTree("{\"estrutura\":\"sequencia\",\"slots\":{\"a\":\"andar\"},\"vezes\":{}}")));
  }

  @Test
  void oldAttemptsKeepOriginalMapAndTimeRule() throws Exception {
    var json = new ObjectMapper(); var rules = new GameRules(json);
    var state = json.readTree("{\"slots\":{\"a\":\"pular\",\"b\":\"andar\"},\"vezes\":{\"r\":2}}");
    var oldPhase = rules.phaseForState(6, state);
    assertEquals(3, rules.simulate(oldPhase, rules.state(oldPhase, state), 20).stars());
    assertEquals(2, rules.simulate(oldPhase, rules.state(oldPhase, state), 200).stars());
    ((com.fasterxml.jackson.databind.node.ObjectNode) state).put("versaoRegras", 2);
    var newPhase = rules.phaseForState(6, state);
    assertFalse(rules.simulate(newPhase, rules.state(newPhase, state), 20).success());
    assertEquals(2, rules.state(newPhase, state).path("versaoRegras").asInt());
  }

  @Test
  void rejectsUnknownOrMalformedVersions() throws Exception {
    var json = new ObjectMapper(); var rules = new GameRules(json);
    for (String version : new String[]{"null", "0", "3", "2.5", "\"2\"", "true", "4294967298"}) {
      var value = json.readTree("{\"versaoRegras\":" + version + "}");
      assertThrows(ApiError.class, () -> rules.phaseForState(6, value));
    }
  }
}
