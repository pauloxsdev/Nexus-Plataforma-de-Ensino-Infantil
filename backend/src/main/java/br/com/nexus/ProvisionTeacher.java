package br.com.nexus;

import java.util.UUID;
import org.springframework.boot.*;
import org.springframework.stereotype.Component;

/** Offline administrative command: never expose teacher provisioning publicly. */
@Component
class ProvisionTeacher implements ApplicationRunner {
  final Auth auth;
  final org.springframework.transaction.support.TransactionTemplate transaction;

  ProvisionTeacher(Auth auth, org.springframework.transaction.PlatformTransactionManager manager) {
    this.auth = auth;
    transaction = new org.springframework.transaction.support.TransactionTemplate(manager);
  }

  public void run(ApplicationArguments args) {
    if (!args.containsOption("provision-teacher")) return;
    String login = System.getenv("TEACHER_LOGIN"), password = System.getenv("TEACHER_PASSWORD");
    ApiError.require(
        login != null && login.matches("[a-z0-9._-]{3,80}"), 400, "TEACHER_LOGIN inválido.");
    ApiError.require(
        password != null
            && password.length() >= 12
            && password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72,
        400,
        "TEACHER_PASSWORD deve ter 12 caracteres ou mais, até 72 bytes.");
    transaction.executeWithoutResult(
        status -> {
          var ids =
              auth.db.queryForList(
                  "INSERT INTO teachers(id,login,password_hash) VALUES (?,?,?) ON CONFLICT(login)"
                      + " DO UPDATE SET password_hash=EXCLUDED.password_hash RETURNING id",
                  UUID.randomUUID(),
                  login,
                  auth.passwords.encode(password));
          auth.db.update("DELETE FROM sessions WHERE teacher_id=?", ids.getFirst().get("id"));
        });
    System.out.println(
        "Professor provisionado; sessões anteriores revogadas. Remova TEACHER_PASSWORD do"
            + " ambiente.");
    System.exit(0);
  }
}
