package com.football.app.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.model.dto.TrainingSaveDTO;
import com.football.app.model.entity.Training;

import java.time.LocalDate;
import java.util.List;

public interface TrainingService {

    Page<Training> page(int current, int size, String type, LocalDate start, LocalDate end);

    Training get(String id);

    List<Training> today();

    List<Training> week();

    Training save(TrainingSaveDTO dto);

    void remove(String id);
}
