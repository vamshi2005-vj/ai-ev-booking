package com.eventsphere.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class BookingRequest {
    @NotNull
    private Long eventId;

    @NotNull
    @Min(value = 1, message = "Number of tickets must be greater than zero")
    private Integer numberOfTickets;
}
