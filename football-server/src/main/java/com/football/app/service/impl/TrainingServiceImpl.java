package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.common.exception.BusinessException;
import com.football.app.model.dto.TrainingSaveDTO;
import com.football.app.model.entity.Training;
import com.football.app.repository.TrainingMapper;
import com.football.app.service.TrainingService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 训练计划服务实现
 */
@Service
public class TrainingServiceImpl implements TrainingService {

    private final TrainingMapper trainingMapper;

    public TrainingServiceImpl(TrainingMapper trainingMapper) {
        this.trainingMapper = trainingMapper;
    }

    @Override
    public Page<Training> page(int current, int size, String type, LocalDate start, LocalDate end) {
        LambdaQueryWrapper<Training> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(type)) {
            wrapper.eq(Training::getType, type);
        }
        if (start != null) {
            wrapper.ge(Training::getTrainDate, start);
        }
        if (end != null) {
            wrapper.le(Training::getTrainDate, end);
        }
        wrapper.orderByDesc(Training::getTrainDate);
        return trainingMapper.selectPage(new Page<>(current, size), wrapper);
    }

    @Override
    public Training get(String id) {
        Training training = trainingMapper.selectById(id);
        if (training == null) {
            throw new BusinessException(404, "训练计划不存在");
        }
        return training;
    }

    @Override
    public List<Training> today() {
        return trainingMapper.selectList(new LambdaQueryWrapper<Training>()
                .eq(Training::getTrainDate, LocalDate.now())
                .orderByAsc(Training::getStartTime));
    }

    @Override
    public List<Training> week() {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);
        return trainingMapper.selectList(new LambdaQueryWrapper<Training>()
                .between(Training::getTrainDate, monday, sunday)
                .orderByAsc(Training::getTrainDate));
    }

    @Override
    public Training save(TrainingSaveDTO dto) {
        Training training;
        if (StringUtils.hasText(dto.getId())) {
            training = trainingMapper.selectById(dto.getId());
            if (training == null) {
                throw new BusinessException(404, "训练计划不存在");
            }
        } else {
            training = new Training();
            training.setId(UUID.randomUUID().toString().replace("-", ""));
            training.setIntensity("medium");
        }
        BeanUtils.copyProperties(dto, training);
        if (StringUtils.hasText(dto.getId())) {
            trainingMapper.updateById(training);
        } else {
            trainingMapper.insert(training);
        }
        return training;
    }

    @Override
    public void remove(String id) {
        trainingMapper.deleteById(id);
    }
}
