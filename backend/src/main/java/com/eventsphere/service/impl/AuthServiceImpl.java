package com.eventsphere.service.impl;

import com.eventsphere.dto.LoginRequest;
import com.eventsphere.dto.LoginResponse;
import com.eventsphere.dto.RegisterRequest;
import com.eventsphere.entity.Role;
import com.eventsphere.entity.User;
import com.eventsphere.exception.InvalidCredentialsException;
import com.eventsphere.exception.ResourceConflictException;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.security.CustomUserDetails;
import com.eventsphere.security.JwtService;
import com.eventsphere.service.AuthService;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .build();
        user = userRepository.save(user);
        return buildResponse(user, null);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword()));
            String token = jwtService.generateToken(authentication);
            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            return buildResponse(principal.getUser(), token);
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    private LoginResponse buildResponse(User user, String token) {
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
