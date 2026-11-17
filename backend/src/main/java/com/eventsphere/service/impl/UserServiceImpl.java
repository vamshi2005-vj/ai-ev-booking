package com.eventsphere.service.impl;

import com.eventsphere.dto.UserResponse;
import com.eventsphere.dto.UserUpdateRequest;
import com.eventsphere.entity.Role;
import com.eventsphere.entity.User;
import com.eventsphere.exception.ResourceNotFoundException;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.service.UserService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getProfile(String email) {
        return toResponse(findByEmail(email));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UserUpdateRequest request) {
        User user = findByEmail(email);
        user.setName(request.getName());
        return toResponse(userRepository.save(user));
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        return toResponse(userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Override
    @Transactional
    public UserResponse setUserActive(Long id, boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse setUserRole(Long id, String role) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(Role.valueOf(role.toUpperCase()));
        return toResponse(userRepository.save(user));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
