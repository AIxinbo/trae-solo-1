package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.football.app.common.exception.BusinessException;
import com.football.app.model.dto.FormationSaveDTO;
import com.football.app.model.entity.Formation;
import com.football.app.model.entity.Player;
import com.football.app.model.vo.FormationDetailVO;
import com.football.app.repository.FormationMapper;
import com.football.app.repository.PlayerMapper;
import com.football.app.service.FormationService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 阵型服务实现
 */
@Service
public class FormationServiceImpl implements FormationService {

    private final FormationMapper formationMapper;
    private final PlayerMapper playerMapper;
    private final ObjectMapper objectMapper;

    public FormationServiceImpl(FormationMapper formationMapper, PlayerMapper playerMapper, ObjectMapper objectMapper) {
        this.formationMapper = formationMapper;
        this.playerMapper = playerMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<Formation> listAll() {
        return formationMapper.selectList(new LambdaQueryWrapper<Formation>()
                .orderByAsc(Formation::getIsPreset).desc());
    }

    @Override
    public FormationDetailVO detail(String id) {
        Formation formation = formationMapper.selectById(id);
        if (formation == null) {
            throw new BusinessException(404, "阵型不存在");
        }
        FormationDetailVO vo = new FormationDetailVO();
        BeanUtils.copyProperties(formation, vo);

        // 解析 positions JSON
        List<FormationDetailVO.PositionVO> positions;
        try {
            positions = objectMapper.readValue(formation.getPositions(),
                    new TypeReference<List<FormationDetailVO.PositionVO>>() {});
        } catch (Exception e) {
            positions = new ArrayList<>();
        }
        vo.setPositions(positions);

        // 计算阵型总分：所有球员评分的平均
        BigDecimal totalScore = calcTotalScore(positions);
        vo.setTotalScore(totalScore);

        return vo;
    }

    @Override
    public Formation save(FormationSaveDTO dto) {
        Formation formation;
        if (StringUtils.hasText(dto.getId())) {
            formation = formationMapper.selectById(dto.getId());
            if (formation == null) {
                throw new BusinessException(404, "阵型不存在");
            }
        } else {
            formation = new Formation();
            formation.setId(UUID.randomUUID().toString().replace("-", ""));
            formation.setIsPreset(0);
        }
        BeanUtils.copyProperties(dto, formation);
        if (StringUtils.hasText(dto.getId())) {
            formationMapper.updateById(formation);
        } else {
            formationMapper.insert(formation);
        }
        return formation;
    }

    @Override
    public void remove(String id) {
        Formation formation = formationMapper.selectById(id);
        if (formation != null && formation.getIsPreset() == 1) {
            throw new BusinessException("预设阵型不可删除");
        }
        formationMapper.deleteById(id);
    }

    /**
     * 计算阵型总分
     */
    private BigDecimal calcTotalScore(List<FormationDetailVO.PositionVO> positions) {
        if (positions == null || positions.isEmpty()) {
            return BigDecimal.ZERO;
        }
        List<Player> allPlayers = playerMapper.selectList(null);
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;
        for (FormationDetailVO.PositionVO pos : positions) {
            if (StringUtils.hasText(pos.getPlayerId())) {
                allPlayers.stream()
                        .filter(p -> pos.getPlayerId().equals(p.getId()))
                        .findFirst()
                        .ifPresent(p -> {
                            // lambda 中不能修改外部变量，这里用占位
                        });
            }
            if (pos.getPlayerRating() != null) {
                sum = sum.add(pos.getPlayerRating());
                count++;
            }
        }
        // 如果 positions 没有球员评分，用全队平均
        if (count == 0 && !allPlayers.isEmpty()) {
            for (Player p : allPlayers) {
                if (p.getRating() != null) {
                    sum = sum.add(p.getRating());
                    count++;
                }
            }
        }
        if (count == 0) return BigDecimal.ZERO;
        return sum.divide(BigDecimal.valueOf(count), 1, RoundingMode.HALF_UP);
    }
}
