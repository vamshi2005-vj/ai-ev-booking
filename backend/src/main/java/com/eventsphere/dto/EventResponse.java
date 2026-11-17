package com.eventsphere.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.eventsphere.entity.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private String eventName;
    private String description;
    private String category;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String city;
    private String organizerName;
    private BigDecimal ticketPrice;
    private Integer capacity;
    private Integer availableSeats;
    private String imageUrl;
    private EventStatus status;
    private boolean soldOut;
    private LocalDateTime createdAt;
}
