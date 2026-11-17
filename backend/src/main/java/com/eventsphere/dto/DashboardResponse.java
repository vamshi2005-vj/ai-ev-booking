package com.eventsphere.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private BigDecimal totalRevenue;
    private List<EventResponse> upcomingEvents;
    private List<BookingResponse> recentBookings;
    private List<EventStatsResponse> eventStats;
}
