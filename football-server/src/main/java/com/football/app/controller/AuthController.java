package com.football.app.controller;

import com.football.app.common.response.Result;
import com.football.app.model.dto.LoginDTO;
import com.football.app.model.entity.User;
import com.football.app.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 认证接口
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Result<Object> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(authService.login(dto.getUsername(), dto.getPassword()));
    }

    @GetMapping("/me")
    public Result<User> me(Authentication auth) {
        return Result.success(authService.currentUser((String) auth.getPrincipal()));
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        // JWT 无状态，前端清除 token 即可
        return Result.success();
    }
}
