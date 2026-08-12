package com.football.app.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 比赛保存请求
 */
@Data
public class MatchSaveDTO {

    private String id;

    @NotBlank(message = "对手不能为空")
    private String opponent;

    @NotNull(message = "比赛时间不能为空")
    private LocalDateTime matchDate;

    private String venue;
    private String homeAway;
    private String status;
    private Integer scoreHome;
    private Integer scoreAway;
    private String formationId;
    private String stats;
}
