package br.com.nexus;

import static org.junit.jupiter.api.Assertions.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.junit.jupiter.api.Test;

class AvatarRulesTest {
  final ObjectMapper json = new ObjectMapper();
  final GameRules rules = new GameRules(json);
  AvatarRulesTest() throws Exception {}

  ObjectNode progress(int count, int stars) {
    var p = json.createObjectNode();
    for (int i = 0; i < count; i++) p.put(rules.phases.get(i).path("id").asText(), stars);
    return p;
  }
  @Test void firstPhaseUnlocksItsRewards() {
    var a = rules.defaultAvatar().put("forma", "gota").put("cor", "#FF5C8A").put("rosto", "piscando").put("acc", "antena");
    assertEquals(rules.defaultAvatar(), rules.validateAvatar(a, progress(0, 0)));
    assertEquals(a, rules.validateAvatar(a, progress(1, 1)));
  }
  @Test void oldQueuedCosmeticsCannotEquipLockedItemsOrBlockSync() {
    var a = rules.defaultAvatar().put("forma", "diamante").put("cor", "#2B4DFF").put("acc", "coroa");
    assertEquals(rules.defaultAvatar().put("cor", "#2B4DFF"), rules.validateAvatar(a, progress(0, 0)));
    assertEquals("coroa", a.path("acc").asText());
  }
  @Test void starsAndPerfectTrailHaveDifferentRequirements() {
    var a = rules.defaultAvatar().put("acc", "raio");
    assertEquals("nenhum", rules.validateAvatar(a, progress(3, 2)).path("acc").asText());
    assertEquals(a, rules.validateAvatar(a, progress(3, 3)));
    a.put("forma", "diamante").put("acc", "coroa");
    var full = rules.validateAvatar(a, progress(rules.phases.size(), 1));
    assertEquals("diamante", full.path("forma").asText());
    assertEquals("nenhum", full.path("acc").asText());
    assertEquals(a, rules.validateAvatar(a, progress(rules.phases.size(), 3)));
  }
  @Test void invalidProgressCannotUnlockCosmetics() {
    var p = json.createObjectNode().put("1", 1.5).put("2", "3").put("3", 4).put("999", 3);
    assertEquals(rules.defaultAvatar(), rules.validateAvatar(rules.defaultAvatar().put("forma", "gota"), p));
  }
  @Test void unknownOrIncompleteAvatarsAreRejected() {
    assertThrows(ApiError.class, () -> rules.validateAvatar(rules.defaultAvatar().put("acc", "inexistente"), progress(8, 3)));
    assertThrows(ApiError.class, () -> rules.validateAvatar(json.createObjectNode(), progress(8, 3)));
  }
}
