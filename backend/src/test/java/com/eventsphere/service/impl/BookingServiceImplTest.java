package com.eventsphere.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.eventsphere.dto.BookingRequest;
import com.eventsphere.dto.BookingResponse;
import com.eventsphere.entity.Booking;
import com.eventsphere.entity.Event;
import com.eventsphere.entity.EventStatus;
import com.eventsphere.entity.Role;
import com.eventsphere.entity.User;
import com.eventsphere.exception.InsufficientSeatsException;
import com.eventsphere.repository.BookingRepository;
import com.eventsphere.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventServiceImpl eventService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    @SuppressWarnings("null")
    void createBookingRejectsInsufficientSeats() {
        User user = User.builder().id(1L).email("john@example.com").role(Role.USER).active(true).build();
        Event event = Event.builder()
                .id(10L)
                .eventName("Tech Summit")
                .eventDate(LocalDate.now().plusDays(10))
                .startTime(LocalTime.of(10, 0))
                .ticketPrice(BigDecimal.valueOf(500))
                .availableSeats(5)
                .status(EventStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(eventService.getActiveEventForBooking(10L)).thenReturn(event);

        BookingRequest request = new BookingRequest();
        request.setEventId(10L);
        request.setNumberOfTickets(6);

        assertThrows(InsufficientSeatsException.class, () -> bookingService.createBooking("john@example.com", request));
    }

    @Test
    @SuppressWarnings("null")
    void createBookingSucceeds() {
        User user = User.builder().id(1L).email("john@example.com").role(Role.USER).active(true).build();
        Event event = Event.builder()
                .id(10L)
                .eventName("Tech Summit")
                .eventDate(LocalDate.now().plusDays(10))
                .startTime(LocalTime.of(10, 0))
                .ticketPrice(BigDecimal.valueOf(500))
                .availableSeats(5)
                .status(EventStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(eventService.getActiveEventForBooking(10L)).thenReturn(event);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> (Booking) invocation.getArgument(0));

        BookingRequest request = new BookingRequest();
        request.setEventId(10L);
        request.setNumberOfTickets(2);

        BookingResponse response = bookingService.createBooking("john@example.com", request);

        assertEquals(2, response.getNumberOfTickets());
        assertEquals(BigDecimal.valueOf(1000), response.getTotalAmount());
        assertEquals(3, event.getAvailableSeats().intValue());
    }
}
