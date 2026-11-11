# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
# Optional CA is used only by managed development environments with a TLS proxy.
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --no-audit --no-fund
COPY index.html vite.config.js postcss.config.js tailwind.config.js ./
COPY src ./src
COPY scripts ./scripts
# The normal build exports the canonical phase catalog for the Java backend.
RUN mkdir -p backend/src/main/resources && npm run build

FROM maven:3.9.11-eclipse-temurin-21 AS backend
WORKDIR /build
COPY backend ./backend
COPY --from=frontend /build/dist ./dist
COPY --from=frontend /build/backend/src/main/resources/fases.json ./backend/src/main/resources/fases.json
COPY --from=frontend /build/backend/src/main/resources/personalizacao.json ./backend/src/main/resources/personalizacao.json
# Secrets are optional on Render. They are never copied into the runtime image.
RUN --mount=type=secret,id=proxy_ca --mount=type=secret,id=maven_settings \
    set -eu; \
    if [ -f /run/secrets/proxy_ca ]; then \
      cp "$JAVA_HOME/lib/security/cacerts" /tmp/nexus-build-cacerts; \
      keytool -importcert -noprompt -alias nexus-build-proxy -file /run/secrets/proxy_ca \
        -keystore /tmp/nexus-build-cacerts -storepass changeit; \
      export MAVEN_OPTS="${MAVEN_OPTS:-} -Djavax.net.ssl.trustStore=/tmp/nexus-build-cacerts"; \
    fi; \
    if [ -f /run/secrets/maven_settings ]; then \
      mvn -s /run/secrets/maven_settings -f backend/pom.xml package -DskipTests --batch-mode --no-transfer-progress; \
    else \
      mvn -f backend/pom.xml package -DskipTests --batch-mode --no-transfer-progress; \
    fi; \
    rm -f /tmp/nexus-build-cacerts

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app
COPY --from=backend /build/backend/target/nexus-api-1.0.0.jar /app/nexus.jar
ENV BIND_ADDRESS=0.0.0.0 \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60.0 -XX:InitialRAMPercentage=20.0 -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/nexus.jar"]
