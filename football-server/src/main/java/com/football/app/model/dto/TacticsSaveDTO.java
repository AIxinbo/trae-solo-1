package com.football.app.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 战术库保存请求
 */
@Data
public class TacticsSaveDTO {

    private String id;

    @NotBlank(message = "战术名称不能为空")
    private String name;

    private String coach;
    private String formationId;
    private String description;
    private String playbook;
}
