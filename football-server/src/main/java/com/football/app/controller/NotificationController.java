package com.football.app.controller;

import com.football.app.common.response.Result;
import com.football.app.model.entity.Notification;
import com.football.app.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知接口
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Result<List<Notification>> list(@RequestParam(required = false) Boolean unreadOnly,
                                           Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return Result.success(notificationService.listByUser(userId, unreadOnly));
    }

    @GetMapping("/unread-count")
    public Result<Integer> unreadCount(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return Result.success(notificationService.unreadCount(userId));
    }

    @PostMapping
    public Result<Notification> save(@RequestBody Notification notification) {
        return Result.success(notificationService.save(notification));
    }

    @PutMapping("/{id}/read")
    public Result<Void> markRead(@PathVariable String id) {
        notificationService.markRead(id);
        return Result.success();
    }

    @PutMapping("/read-all")
    public Result<Void> markAllRead(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        notificationService.markAllRead(userId);
        return Result.success();
    }
}
