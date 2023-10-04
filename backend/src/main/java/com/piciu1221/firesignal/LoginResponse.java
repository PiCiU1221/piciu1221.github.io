package com.piciu1221.firesignal;

import lombok.Data;

@Data
public class LoginResponse {
    private boolean success;
    private String message;

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
