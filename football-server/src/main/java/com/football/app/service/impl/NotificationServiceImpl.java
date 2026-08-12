package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.football.app.model.entity.Notification;
import com.football.app.repository.NotificationMapper;
import com.football.app.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * 通知服务实现
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    @Override
    public List<Notification> listByUser(String userId, Boolean unreadOnly) {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getCreateTime);
        if (Boolean.TRUE.equals(unreadOnly)) {
            wrapper.eq(Notification::getIsRead, 0);
        }
        return notificationMapper.selectList(wrapper);
    }

    @Override
    public int unreadCount(String userId) {
        return Math.toIntExact(notificationMapper.selectCount(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0)));
    }

    @Override
    public Notification save(Notification notification) {
        notification.setId(UUID.randomUUID().toString().replace("-", ""));
        notification.setIsRead(0);
        notificationMapper.insert(notification);
        return notification;
    }

    @Override
    public void markRead(String id) {
        notificationMapper.update(null, new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getId, id)
                .set(Notification::getIsRead, 1));
    }

    @Override
    public void markAllRead(String userId) {
        notificationMapper.update(null, new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0)
                .set(Notification::getIsRead, 1));
    }
}
