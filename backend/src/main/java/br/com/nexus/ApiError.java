package br.com.nexus;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public class ApiError extends RuntimeException {
  final int status;

  public ApiError(int status, String message) {
    super(message);
    this.status = status;
  }

  static void require(boolean condition, int status, String message) {
    if (!condition) throw new ApiError(status, message);
  }
}

@RestControllerAdvice
class ErrorHandler {
  @ExceptionHandler(ApiError.class)
  ResponseEntity<?> known(ApiError e) {
    return ResponseEntity.status(e.status).body(Map.of("erro", e.getMessage()));
  }

  @ExceptionHandler({
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    IllegalArgumentException.class
  })
  ResponseEntity<?> invalid(Exception e) {
    return ResponseEntity.badRequest().body(Map.of("erro", "Dados inválidos."));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<?> unexpected(Exception e) {
    org.slf4j.LoggerFactory.getLogger(ErrorHandler.class)
        .error("Falha interna: {}", e.getClass().getSimpleName());
    return ResponseEntity.internalServerError()
        .body(Map.of("erro", "Não foi possível concluir. Tente novamente."));
  }
}
