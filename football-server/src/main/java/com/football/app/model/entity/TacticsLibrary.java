package com.football.app.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 战术库实体
 */
@Data
@TableName("tactics_library")
public class TacticsLibrary {

    @TableId
    private String id;

    private String name;
    private String coach;
    private String formationId;
    private String description;
    private String playbook;
    private Integer isPreset;

    @TableLogic
    private Integer isDeleted;

    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
