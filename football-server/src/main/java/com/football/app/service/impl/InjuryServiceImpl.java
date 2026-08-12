package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.football.app.common.exception.BusinessException;
import com.football.app.model.entity.Injury;
import com.football.app.repository.InjuryMapper;
import com.football.app.service.InjuryService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 伤病记录服务实现
 */
@Service
public class InjuryServiceImpl implements InjuryService {

    private final InjuryMapper injuryMapper;

    public InjuryServiceImpl(InjuryMapper injuryMapper) {
        this.injuryMapper = injuryMapper;
    }

    @Override
    public List<Injury> listByPlayer(String playerId) {
        return injuryMapper.selectList(new LambdaQueryWrapper<Injury>()
                .eq(Injury::getPlayerId, playerId)
                .orderByDesc(Injury::getStartDate));
    }

    @Override
    public List<Injury> active() {
        return injuryMapper.selectList(new LambdaQueryWrapper<Injury>()
                .eq(Injury::getStatus, "active")
                .orderByDesc(Injury::getStartDate));
    }

    @Override
    public Injury get(String id) {
        Injury injury = injuryMapper.selectById(id);
        if (injury == null) {
            throw new BusinessException(404, "伤病记录不存在");
        }
        return injury;
    }

    @Override
    public Injury save(Injury injury) {
        if (StringUtils.hasText(injury.getId())) {
            injuryMapper.updateById(injury);
        } else {
            injury.setId(UUID.randomUUID().toString().replace("-", ""));
            injury.setStatus("active");
            injuryMapper.insert(injury);
        }
        return injury;
    }

    @Override
    public void recover(String id) {
        Injury injury = injuryMapper.selectById(id);
        if (injury == null) {
            throw new BusinessException(404, "伤病记录不存在");
        }
        injury.setStatus("recovered");
        injury.setActualReturn(LocalDate.now());
        injuryMapper.updateById(injury);
    }
}
