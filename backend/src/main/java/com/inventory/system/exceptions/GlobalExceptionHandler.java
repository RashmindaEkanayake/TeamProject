package com.inventory.system.exceptions;

import java.util.*;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
    return ResponseEntity.status(status).body(Map.of("status", status.value(), "message", message));
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> notFound(Exception e) {
    return error(HttpStatus.NOT_FOUND, e.getMessage());
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<?> denied(Exception e) {
    return error(HttpStatus.FORBIDDEN, "You do not have permission to perform this action");
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<?> auth(Exception e) {
    return error(HttpStatus.UNAUTHORIZED, "Invalid username or password");
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
    Map<String, String> fields = new LinkedHashMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(f -> fields.put(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "status",
                400,
                "message",
                "Invalid input: "
                    + String.join(
                        "; ",
                        fields.entrySet().stream()
                            .map(f -> f.getKey() + " " + f.getValue())
                            .toList()),
                "errors",
                fields));
  }

  @ExceptionHandler({
    IllegalArgumentException.class,
    InsufficientStockException.class,
    jakarta.validation.ConstraintViolationException.class
  })
  public ResponseEntity<?> bad(Exception e) {
    return error(HttpStatus.BAD_REQUEST, e.getMessage());
  }

  @ExceptionHandler({
    IllegalStateException.class,
    org.springframework.dao.ConcurrencyFailureException.class
  })
  public ResponseEntity<?> conflict(Exception e) {
    return error(
        HttpStatus.CONFLICT,
        "The record changed or this action is no longer valid. Refresh and try again.");
  }

  @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
  public ResponseEntity<?> integrity(Exception e) {
    return error(
        HttpStatus.CONFLICT,
        "Duplicate data or a record still referenced by another workflow. Remove its references"
            + " before deleting.");
  }

  @ExceptionHandler({
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
    org.springframework.web.bind.MissingServletRequestParameterException.class,
    org.springframework.web.multipart.support.MissingServletRequestPartException.class
  })
  public ResponseEntity<?> malformed(Exception e) {
    return error(
        HttpStatus.BAD_REQUEST,
        "Malformed request. Check field names, numeric values and required fields.");
  }

  @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
  public ResponseEntity<?> large(Exception e) {
    return error(HttpStatus.PAYLOAD_TOO_LARGE, "File must be no larger than 10 MB");
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> other(Exception e) {
    org.slf4j.LoggerFactory.getLogger(getClass()).error("Unhandled request failure", e);
    return error(HttpStatus.INTERNAL_SERVER_ERROR, "Request could not be completed. Please retry.");
  }
}
