package com.eventsphere.exception;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.ErrorResponse;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ApiResponse<Object>> handleConflict(ResourceConflictException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler({InvalidCredentialsException.class, UnauthorizedAccessException.class})
    public ResponseEntity<ApiResponse<Object>> handleAuth(RuntimeException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
    }

    @ExceptionHandler({EventNotFoundException.class, ResourceNotFoundException.class})
    public ResponseEntity<ApiResponse<Object>> handleNotFound(RuntimeException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler({InsufficientSeatsException.class, BookingCancellationException.class, BadRequestException.class})
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(RuntimeException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiResponse<Object>> handleValidation(Exception ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (ex instanceof MethodArgumentNotValidException) {
            ((MethodArgumentNotValidException) ex).getBindingResult().getFieldErrors()
                    .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        } else if (ex instanceof BindException) {
            ((BindException) ex).getBindingResult().getFieldErrors()
                    .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        } else if (ex instanceof ConstraintViolationException) {
            ((ConstraintViolationException) ex).getConstraintViolations()
                    .forEach(violation -> errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        }
        return ResponseEntity.badRequest().body(ApiResponse.<Object>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<Object>builder()
                .success(false)
                .message(ex.getMessage() == null ? "Internal server error" : ex.getMessage())
                .data(null)
                .build());
    }

    private ResponseEntity<ApiResponse<Object>> build(HttpStatus status, String message, Object data) {
        return ResponseEntity.status(status).body(ApiResponse.builder()
                .success(false)
                .message(message)
                .data(data)
                .build());
    }
}
