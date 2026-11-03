package br.com.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NexusApplication {
  public static void main(String[] args) {
    var app = new SpringApplication(NexusApplication.class);
    if (java.util.Arrays.asList(args).contains("--provision-teacher"))
      app.setWebApplicationType(org.springframework.boot.WebApplicationType.NONE);
    app.run(args);
  }
}
