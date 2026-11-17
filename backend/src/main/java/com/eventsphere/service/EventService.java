package com.eventsphere.service;

import java.time.LocalDate;
import java.util.List;
import com.eventsphere.dto.EventRequest;
import com.eventsphere.dto.EventResponse;

public interface EventService {
    List<EventResponse> getEvents(String keyword, String category, String city, LocalDate date, String sort);
    EventResponse getEventById(Long id);
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(Long id, EventRequest request);
    void deleteEvent(Long id);
}
