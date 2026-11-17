package com.eventsphere.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

import com.eventsphere.entity.Event;
import com.eventsphere.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatusNot(EventStatus status);

    List<Event> findByCategoryIgnoreCaseAndStatusNot(String category, EventStatus status);

    List<Event> findByCityIgnoreCaseAndStatusNot(String city, EventStatus status);

    List<Event> findByEventDateAndStatusNot(LocalDate eventDate, EventStatus status);

    @Query("select e from Event e where lower(e.eventName) like lower(concat('%', :keyword, '%')) or lower(e.description) like lower(concat('%', :keyword, '%')) or lower(e.category) like lower(concat('%', :keyword, '%')) or lower(e.city) like lower(concat('%', :keyword, '%'))")
    List<Event> search(@Param("keyword") String keyword);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);
}
