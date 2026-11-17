package com.eventsphere.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.eventsphere.entity.BookingStatus;
import com.eventsphere.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long userId;
    private Long eventId;
    private String eventName;
    private Integer numberOfTickets;
    private BigDecimal totalAmount;
    private LocalDateTime bookingDate;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
}
