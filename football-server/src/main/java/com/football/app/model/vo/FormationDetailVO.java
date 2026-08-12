package com.football.app.model.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 阵型详情 + 总分 VO
 */
@Data
public class FormationDetailVO {
    private String id;
    private String name;
    private String label;
    private String summary;
    private Integer isPreset;
    private List<PositionVO> positions;

    /** 阵型总分（根据球员能力综合计算） */
    private BigDecimal totalScore;

    @Data
    public static class PositionVO {
        private String no;
        private String left;
        private String top;
        private String role;
        private String pos;
        private String playerId;
        private String playerName;
        private BigDecimal playerRating;
    }
}
