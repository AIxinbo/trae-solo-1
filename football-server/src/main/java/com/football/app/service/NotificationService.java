package com.football.app.service;

import com.football.app.model.entity.Notification;

import java.util.List;

public interface NotificationService {

    List<Notification> listByUser(String userId, Boolean unreadOnly);

    int unreadCount(String userId);

    Notification save(Notification notification);

    void markRead(String id);

    void markAllRead(String userId);
}
