package com.football.app.model.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 伤病记录实体
 */
@Data
@TableName("injuries")
public class Injury {

    @TableId
    private String id;

    private String playerId;
    private String injuryType;
    private String description;
    private LocalDate startDate;
    private LocalDate expectedReturn;
    private LocalDate actualReturn;
    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
