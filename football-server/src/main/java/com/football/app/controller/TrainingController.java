package com.football.app.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.common.response.Result;
import com.football.app.model.dto.TrainingSaveDTO;
import com.football.app.model.entity.Training;
import com.football.app.service.TrainingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 训练计划接口
 */
@RestController
@RequestMapping("/trainings")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping
    public Result<Page<Training>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return Result.success(trainingService.page(current, size, type, start, end));
    }

    @GetMapping("/today")
    public Result<List<Training>> today() {
        return Result.success(trainingService.today());
    }

    @GetMapping("/week")
    public Result<List<Training>> week() {
        return Result.success(trainingService.week());
    }

    @GetMapping("/{id}")
    public Result<Training> get(@PathVariable String id) {
        return Result.success(trainingService.get(id));
    }

    @PostMapping
    public Result<Training> save(@Valid @RequestBody TrainingSaveDTO dto) {
        return Result.success(trainingService.save(dto));
    }

    @PutMapping("/{id}")
    public Result<Training> update(@PathVariable String id, @Valid @RequestBody TrainingSaveDTO dto) {
        dto.setId(id);
        return Result.success(trainingService.save(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        trainingService.remove(id);
        return Result.success();
    }
}
