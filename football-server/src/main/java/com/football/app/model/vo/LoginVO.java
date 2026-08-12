package com.football.app.model.vo;

import lombok.Data;

/**
 * 登录响应
 */
@Data
public class LoginVO {
    private String token;
    private String userId;
    private String username;
    private String realName;
    private String role;
    private String avatar;
}
