package com.football.app.service;

import com.football.app.model.entity.User;

public interface AuthService {

    /**
     * 登录
     */
    Object login(String username, String password);

    /**
     * 获取当前登录用户
     */
    User currentUser(String userId);
}
