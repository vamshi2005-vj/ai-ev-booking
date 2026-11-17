package com.eventsphere.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank
    private String name;
}
