package com.football.app.model.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 比赛实体
 */
@Data
@TableName("matches")
public class Match {

    @TableId
    private String id;

    private String opponent;
    private LocalDateTime matchDate;
    private String venue;
    private String homeAway;
    private String status;
    private Integer scoreHome;
    private Integer scoreAway;
    private String formationId;
    private String stats;

    @TableLogic
    private Integer isDeleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
