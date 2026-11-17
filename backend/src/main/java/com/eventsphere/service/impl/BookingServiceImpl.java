package com.eventsphere.service.impl;

import com.eventsphere.dto.BookingRequest;
import com.eventsphere.dto.BookingResponse;
import com.eventsphere.entity.Booking;
import com.eventsphere.entity.BookingStatus;
import com.eventsphere.entity.Event;
import com.eventsphere.entity.PaymentStatus;
import com.eventsphere.entity.User;
import com.eventsphere.exception.BookingCancellationException;
import com.eventsphere.exception.InsufficientSeatsException;
import com.eventsphere.exception.UnauthorizedAccessException;
import com.eventsphere.repository.BookingRepository;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.service.BookingService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventServiceImpl eventService;

    @Override
    @Transactional
    public BookingResponse createBooking(String email, BookingRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"));
        Event event = eventService.getActiveEventForBooking(request.getEventId());

        if (request.getNumberOfTickets() == null || request.getNumberOfTickets() < 1) {
            throw new InsufficientSeatsException("Number of tickets must be greater than zero");
        }
        if (event.getAvailableSeats() == null || event.getAvailableSeats() < request.getNumberOfTickets()) {
            throw new InsufficientSeatsException("Only " + event.getAvailableSeats() + " seats are available.");
        }

        BigDecimal totalAmount = event.getTicketPrice().multiply(BigDecimal.valueOf(request.getNumberOfTickets()));
        Booking booking = Booking.builder()
                .bookingReference("EVS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .event(event)
                .numberOfTickets(request.getNumberOfTickets())
                .totalAmount(totalAmount)
                .bookingDate(LocalDateTime.now())
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .build();

        event.setAvailableSeats(event.getAvailableSeats() - request.getNumberOfTickets());
        if (event.getAvailableSeats() <= 0) {
            event.setStatus(com.eventsphere.entity.EventStatus.SOLD_OUT);
        }

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"));
        return bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBooking(Long id, String email, boolean admin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingCancellationException("Booking not found"));
        if (!admin && !booking.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new UnauthorizedAccessException("You are not allowed to access this booking");
        }
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, String email, boolean admin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingCancellationException("Booking not found"));
        if (!admin && !booking.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new UnauthorizedAccessException("You are not allowed to cancel this booking");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BookingCancellationException("Booking is already cancelled");
        }
        LocalDateTime eventDateTime = LocalDateTime.of(booking.getEvent().getEventDate(), booking.getEvent().getStartTime());
        if (eventDateTime.minusHours(2).isBefore(LocalDateTime.now())) {
            throw new BookingCancellationException("Cancellation window has expired");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getNumberOfTickets());
        if (event.getStatus() == com.eventsphere.entity.EventStatus.SOLD_OUT) {
            event.setStatus(com.eventsphere.entity.EventStatus.ACTIVE);
        }
        return toResponse(bookingRepository.save(booking));
    }

    private BookingResponse toResponse(Booking booking) {
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
