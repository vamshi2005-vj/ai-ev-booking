package com.eventsphere.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.eventsphere.dto.LoginRequest;
import com.eventsphere.dto.LoginResponse;
import com.eventsphere.dto.RegisterRequest;
import com.eventsphere.entity.Role;
import com.eventsphere.entity.User;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.security.CustomUserDetails;
import com.eventsphere.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("John")
                .email("john@example.com")
                .password("encoded")
                .role(Role.USER)
                .active(true)
                .build();
    }

    @Test
    @SuppressWarnings("null")
    void registerCreatesUser() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setEmail("john@example.com");
        request.setPassword("Password123!");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> (User) invocation.getArgument(0));

        LoginResponse response = authService.register(request);

        assertEquals("john@example.com", response.getEmail());
        assertEquals(Role.USER, response.getRole());
    }

    @Test
    @SuppressWarnings("null")
    void loginReturnsJwtResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("Password123!");

        CustomUserDetails principal = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtService.generateToken(authentication)).thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response.getToken());
        assertEquals("jwt-token", response.getToken());
        assertEquals(1L, response.getUserId());
    }
}
