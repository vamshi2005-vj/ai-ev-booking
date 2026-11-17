package com.eventsphere.service;

import java.util.List;
import com.eventsphere.dto.UserResponse;
import com.eventsphere.dto.UserUpdateRequest;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UserUpdateRequest request);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse setUserActive(Long id, boolean active);
    UserResponse setUserRole(Long id, String role);
}
