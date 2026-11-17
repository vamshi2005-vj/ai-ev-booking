package com.eventsphere.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/events",
        "/events/**",
        "/login",
        "/register",
        "/dashboard",
        "/bookings",
        "/bookings/**",
        "/profile",
        "/admin",
        "/admin/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}

