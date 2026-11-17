package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.EventRequest;
import com.eventsphere.dto.EventResponse;
import com.eventsphere.service.EventService;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .message("Events fetched successfully")
                .data(eventService.getEvents(keyword, category, city, date, sort))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .message("Event fetched successfully")
                .data(eventService.getEventById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .message("Event created successfully")
                .data(eventService.createEvent(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .message("Event updated successfully")
                .data(eventService.updateEvent(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Event deleted successfully")
                .data(null)
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventResponse>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .message("Search completed successfully")
                .data(eventService.getEvents(keyword, null, null, null, null))
                .build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .message("Events fetched successfully")
                .data(eventService.getEvents(null, category, null, null, null))
                .build());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> byCity(@PathVariable String city) {
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .message("Events fetched successfully")
                .data(eventService.getEvents(null, null, city, null, null))
                .build());
    }
}
