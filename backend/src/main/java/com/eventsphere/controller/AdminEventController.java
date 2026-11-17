package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.EventRequest;
import com.eventsphere.dto.EventResponse;
import com.eventsphere.service.EventService;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> create(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .message("Event created successfully")
                .data(eventService.createEvent(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.<EventResponse>builder()
                .success(true)
                .message("Event updated successfully")
                .data(eventService.updateEvent(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Event deleted successfully")
                .data(null)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> all() {
        return ResponseEntity.ok(ApiResponse.<List<EventResponse>>builder()
                .success(true)
                .message("Events fetched successfully")
                .data(eventService.getEvents(null, null, null, null, null))
                .build());
    }
}
