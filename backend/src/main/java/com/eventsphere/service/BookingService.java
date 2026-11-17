package com.eventsphere.service;

import java.util.List;
import com.eventsphere.dto.BookingRequest;
import com.eventsphere.dto.BookingResponse;

public interface BookingService {
    BookingResponse createBooking(String email, BookingRequest request);
    List<BookingResponse> getMyBookings(String email);
    List<BookingResponse> getAllBookings();
    BookingResponse getBooking(Long id, String email, boolean admin);
    BookingResponse cancelBooking(Long id, String email, boolean admin);
}
