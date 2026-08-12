package com.football.app.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 阵型保存请求
 */
@Data
public class FormationSaveDTO {

    private String id;

    @NotBlank(message = "阵型名称不能为空")
    private String name;

    private String label;
    private String summary;

    @NotBlank(message = "位置数据不能为空")
    private String positions;
}
