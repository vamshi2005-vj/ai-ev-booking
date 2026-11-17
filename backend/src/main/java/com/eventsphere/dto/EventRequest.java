package com.eventsphere.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class EventRequest {
    @NotBlank
    private String eventName;

    private String description;

    @NotBlank
    private String category;

    @NotNull
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank
    private String venue;

    @NotBlank
    private String city;

    @NotBlank
    private String organizerName;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true, message = "Ticket price cannot be negative")
    private BigDecimal ticketPrice;

    @NotNull
    @Min(value = 1, message = "Capacity must be greater than zero")
    private Integer capacity;

    private String imageUrl;

    @NotNull
    private com.eventsphere.entity.EventStatus status;
}
