package com.football.app.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 球员保存请求
 */
@Data
public class PlayerSaveDTO {

    private String id;

    @NotBlank(message = "号码不能为空")
    private String no;

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "位置不能为空")
    private String posLabel;

    @NotBlank(message = "位置代码不能为空")
    private String pos;

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
}
