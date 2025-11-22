package com.autandojam.controller;

import com.autandojam.dto.ApiResponse;
import com.autandojam.dto.LoginRequest;
import com.autandojam.dto.LoginResponse;
import com.autandojam.entity.User;
import com.autandojam.service.UserService;
import com.autandojam.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.findByUsername(request.getUsername()).orElse(null);
        
        if (user == null || !userService.validatePassword(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid credentials", null));
        }

        if (!user.getIsActive()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User account is inactive", null));
        }

        String token = jwtProvider.generateToken(user.getUserId(), user.getUsername(), user.getRole().toString());
        
        LoginResponse response = LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().toString())
                .build();

        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid token format", null));
        }

        String jwtToken = token.substring(7);
        boolean isValid = jwtProvider.validateToken(jwtToken);
        
        if (isValid) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Token is valid", null));
        } else {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid or expired token", null));
        }
    }
}
