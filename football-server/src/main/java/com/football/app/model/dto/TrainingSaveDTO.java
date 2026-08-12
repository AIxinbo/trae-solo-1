package com.football.app.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * 训练计划保存请求
 */
@Data
public class TrainingSaveDTO {

    private String id;

    @NotBlank(message = "标题不能为空")
    private String title;

    @NotNull(message = "训练日期不能为空")
    private LocalDate trainDate;

    private String startTime;
    private String endTime;
    private String location;
    private String type;
    private String intensity;
    private String content;
    private String attendance;
}
