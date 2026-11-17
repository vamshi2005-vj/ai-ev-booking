package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.DashboardResponse;
import com.eventsphere.dto.UserResponse;
import com.eventsphere.service.AdminService;
import com.eventsphere.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.<DashboardResponse>builder()
                .success(true)
                .message("Dashboard loaded successfully")
                .data(adminService.getDashboard())
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> users() {
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Users loaded successfully")
                .data(userService.getAllUsers())
                .build());
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<ApiResponse<UserResponse>> activate(@PathVariable Long id, @RequestBody boolean active) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User status updated successfully")
                .data(userService.setUserActive(id, active))
                .build());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> role(@PathVariable Long id, @RequestBody String role) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User role updated successfully")
                .data(userService.setUserRole(id, role))
                .build());
    }
}
