package com.eventsphere.service.impl;

import com.eventsphere.dto.BookingResponse;
import com.eventsphere.dto.DashboardResponse;
import com.eventsphere.dto.EventResponse;
import com.eventsphere.dto.EventStatsResponse;
import com.eventsphere.entity.Booking;
import com.eventsphere.entity.BookingStatus;
import com.eventsphere.entity.Event;
import com.eventsphere.entity.EventStatus;
import com.eventsphere.repository.BookingRepository;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.service.AdminService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    @Override
    public DashboardResponse getDashboard() {
        List<EventResponse> upcomingEvents = eventRepository.findAll().stream()
                .filter(event -> event.getStatus() != EventStatus.CANCELLED)
                .filter(event -> !LocalDateTime.of(event.getEventDate(), event.getStartTime()).isBefore(LocalDateTime.now()))
                .sorted(Comparator.comparing(Event::getEventDate).thenComparing(Event::getStartTime))
                .limit(5)
                .map(this::toEventResponse)
                .collect(Collectors.toList());

        List<BookingResponse> recentBookings = bookingRepository.findAll().stream()
                .sorted(Comparator.comparing(Booking::getBookingDate).reversed())
                .limit(5)
                .map(this::toBookingResponse)
                .collect(Collectors.toList());

        List<EventStatsResponse> eventStats = eventRepository.findAll().stream()
                .map(event -> EventStatsResponse.builder()
                        .eventId(event.getId())
                        .eventName(event.getEventName())
                        .bookingCount(bookingRepository.countByEventId(event.getId()))
                        .build())
                .sorted(Comparator.comparing(EventStatsResponse::getBookingCount).reversed())
                .limit(10)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalEvents(eventRepository.count())
                .totalBookings(bookingRepository.count())
                .totalRevenue(totalRevenue)
                .upcomingEvents(upcomingEvents)
                .recentBookings(recentBookings)
                .eventStats(eventStats)
                .build();
    }

    private EventResponse toEventResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .eventName(event.getEventName())
                .description(event.getDescription())
                .category(event.getCategory())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .venue(event.getVenue())
                .city(event.getCity())
                .organizerName(event.getOrganizerName())
                .ticketPrice(event.getTicketPrice())
                .capacity(event.getCapacity())
                .availableSeats(event.getAvailableSeats())
                .imageUrl(event.getImageUrl())
                .status(event.getStatus())
                .soldOut(event.getAvailableSeats() != null && event.getAvailableSeats() <= 0)
                .createdAt(event.getCreatedAt())
                .build();
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .userId(booking.getUser().getId())
                .eventId(booking.getEvent().getId())
                .eventName(booking.getEvent().getEventName())
                .numberOfTickets(booking.getNumberOfTickets())
                .totalAmount(booking.getTotalAmount())
                .bookingDate(booking.getBookingDate())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .build();
    }
}
