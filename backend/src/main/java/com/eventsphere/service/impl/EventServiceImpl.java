package com.eventsphere.service.impl;

import com.eventsphere.dto.EventRequest;
import com.eventsphere.dto.EventResponse;
import com.eventsphere.entity.Event;
import com.eventsphere.entity.EventStatus;
import com.eventsphere.exception.EventNotFoundException;
import com.eventsphere.exception.ResourceNotFoundException;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.service.EventService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Override
    public List<EventResponse> getEvents(String keyword, String category, String city, LocalDate date, String sort) {
        List<Event> events = eventRepository.findByStatusNot(EventStatus.CANCELLED);
        if (keyword != null && !keyword.trim().isEmpty()) {
            String query = keyword.trim();
            events = eventRepository.search(query);
        }
        if (category != null && !category.trim().isEmpty()) {
            String categoryFilter = category.trim();
            events = events.stream()
                    .filter(event -> event.getCategory() != null && event.getCategory().equalsIgnoreCase(categoryFilter))
                    .collect(Collectors.toList());
        }
        if (city != null && !city.trim().isEmpty()) {
            String cityFilter = city.trim();
            events = events.stream()
                    .filter(event -> event.getCity() != null && event.getCity().equalsIgnoreCase(cityFilter))
                    .collect(Collectors.toList());
        }
        if (date != null) {
            events = events.stream().filter(event -> date.equals(event.getEventDate())).collect(Collectors.toList());
        }

        if (sort != null) {
            String value = sort.toLowerCase(Locale.ROOT);
            if ("price".equals(value)) {
                events.sort(Comparator.comparing(Event::getTicketPrice));
            } else if ("date".equals(value)) {
                events.sort(Comparator.comparing(Event::getEventDate).thenComparing(Event::getStartTime));
            }
        }

        return events.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException("Event not found"));
        return toResponse(event);
    }

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Event event = Event.builder()
                .eventName(request.getEventName())
                .description(request.getDescription())
                .category(request.getCategory())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .venue(request.getVenue())
                .city(request.getCity())
                .organizerName(request.getOrganizerName())
                .ticketPrice(request.getTicketPrice())
                .capacity(request.getCapacity())
                .availableSeats(request.getCapacity())
                .imageUrl(request.getImageUrl())
                .status(request.getStatus())
                .build();
        return toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException("Event not found"));
        event.setEventName(request.getEventName());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setVenue(request.getVenue());
        event.setCity(request.getCity());
        event.setOrganizerName(request.getOrganizerName());
        event.setTicketPrice(request.getTicketPrice());
        event.setCapacity(request.getCapacity());
        event.setAvailableSeats(Math.min(event.getAvailableSeats(), request.getCapacity()));
        event.setImageUrl(request.getImageUrl());
        event.setStatus(request.getStatus());
        return toResponse(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    public Event getActiveEventForBooking(Long id) {
        Event event = eventRepository.findByIdForUpdate(id).orElseThrow(() -> new EventNotFoundException("Event not found"));
        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.COMPLETED) {
            throw new ResourceNotFoundException("Event unavailable for booking");
        }
        if (event.getEventDate() != null && LocalDateTime.of(event.getEventDate(), event.getStartTime()).isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Event unavailable for booking");
        }
        return event;
    }

    private EventResponse toResponse(Event event) {
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
}
