package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.common.exception.BusinessException;
import com.football.app.model.dto.PlayerSaveDTO;
import com.football.app.model.entity.Player;
import com.football.app.repository.PlayerMapper;
import com.football.app.service.PlayerService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

/**
 * 球员服务实现
 */
@Service
public class PlayerServiceImpl implements PlayerService {

    private final PlayerMapper playerMapper;

    public PlayerServiceImpl(PlayerMapper playerMapper) {
        this.playerMapper = playerMapper;
    }

    @Override
    public Page<Player> page(int current, int size, String keyword, String pos) {
        LambdaQueryWrapper<Player> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Player::getName, keyword)
                   .or().like(Player::getNo, keyword);
        }
        if (StringUtils.hasText(pos)) {
            wrapper.eq(Player::getPos, pos);
        }
        wrapper.orderByAsc(Player::getNo);
        return playerMapper.selectPage(new Page<>(current, size), wrapper);
    }

    @Override
    public Player get(String id) {
        Player player = playerMapper.selectById(id);
        if (player == null) {
            throw new BusinessException(404, "球员不存在");
        }
        return player;
    }

    @Override
    public List<Player> listAll() {
        return playerMapper.selectList(new LambdaQueryWrapper<Player>()
                .orderByAsc(Player::getNo));
    }

    @Override
    public Player save(PlayerSaveDTO dto) {
        Player player;
        if (StringUtils.hasText(dto.getId())) {
            player = playerMapper.selectById(dto.getId());
            if (player == null) {
                throw new BusinessException(404, "球员不存在");
            }
        } else {
            player = new Player();
            player.setId(UUID.randomUUID().toString().replace("-", ""));
            player.setHealth("healthy");
        }
        BeanUtils.copyProperties(dto, player);
        // 计算总评分 = 6 项能力平均
        player.setRating(calcRating(player));
        if (player.getRatingDelta() == null) {
            player.setRatingDelta("0");
        }
        if (StringUtils.hasText(dto.getId())) {
            playerMapper.updateById(player);
        } else {
            playerMapper.insert(player);
        }
        return player;
    }

    @Override
    public void remove(String id) {
        playerMapper.deleteById(id);
    }

    /**
     * 计算球员总评分：6 项能力加权平均
     */
    private BigDecimal calcRating(Player p) {
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;
        if (p.getRatingAttack() != null) { sum = sum.add(p.getRatingAttack()); count++; }
        if (p.getRatingPass() != null) { sum = sum.add(p.getRatingPass()); count++; }
        if (p.getRatingSetpiece() != null) { sum = sum.add(p.getRatingSetpiece()); count++; }
        if (p.getRatingDefense() != null) { sum = sum.add(p.getRatingDefense()); count++; }
        if (p.getRatingSpeed() != null) { sum = sum.add(p.getRatingSpeed()); count++; }
        if (p.getRatingPhysical() != null) { sum = sum.add(p.getRatingPhysical()); count++; }
        if (count == 0) return BigDecimal.ZERO;
        return sum.divide(BigDecimal.valueOf(count), 1, RoundingMode.HALF_UP);
    }
}
