package com.LivingHistory.Exception;

public class JWTTokenExpiration extends RuntimeException {
    public JWTTokenExpiration(String message) {
        super(message);
    }
}
