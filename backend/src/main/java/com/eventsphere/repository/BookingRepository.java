package com.eventsphere.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.eventsphere.entity.Booking;
import com.eventsphere.entity.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);
    Optional<Booking> findByBookingReference(String bookingReference);
    long countByBookingStatus(BookingStatus bookingStatus);
    long countByEventId(Long eventId);
}
