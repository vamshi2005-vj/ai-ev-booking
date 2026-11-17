package com.eventsphere.service;

import com.eventsphere.dto.LoginRequest;
import com.eventsphere.dto.LoginResponse;
import com.eventsphere.dto.RegisterRequest;

public interface AuthService {
    LoginResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}
