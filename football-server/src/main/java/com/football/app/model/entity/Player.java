package com.football.app.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 球员实体
 */
@Data
@TableName("players")
public class Player {

    @TableId
    private String id;

    private String no;
    private String name;
    private String posLabel;
    private String pos;
    private BigDecimal rating;
    private BigDecimal ratingAttack;
    private BigDecimal ratingPass;
    private BigDecimal ratingSetpiece;
    private BigDecimal ratingDefense;
    private BigDecimal ratingSpeed;
    private BigDecimal ratingPhysical;
    private String health;
    private String healthNote;
    private Integer age;
    private Integer height;
    private Integer weight;
    private String contract;
    private String value;
    private String ratingDelta;

    @TableLogic
    private Integer isDeleted;

    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
