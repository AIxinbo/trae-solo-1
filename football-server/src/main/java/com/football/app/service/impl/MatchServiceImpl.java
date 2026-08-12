package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.common.exception.BusinessException;
import com.football.app.model.dto.MatchSaveDTO;
import com.football.app.model.entity.Match;
import com.football.app.repository.MatchMapper;
import com.football.app.service.MatchService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 比赛服务实现
 */
@Service
public class MatchServiceImpl implements MatchService {

    private final MatchMapper matchMapper;

    public MatchServiceImpl(MatchMapper matchMapper) {
        this.matchMapper = matchMapper;
    }

    @Override
    public Page<Match> page(int current, int size, String status, String keyword) {
        LambdaQueryWrapper<Match> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(Match::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Match::getOpponent, keyword);
        }
        wrapper.orderByDesc(Match::getMatchDate);
        return matchMapper.selectPage(new Page<>(current, size), wrapper);
    }

    @Override
    public Match get(String id) {
        Match match = matchMapper.selectById(id);
        if (match == null) {
            throw new BusinessException(404, "比赛不存在");
        }
        return match;
    }

    @Override
    public List<Match> upcoming(int limit) {
        return matchMapper.selectList(new LambdaQueryWrapper<Match>()
                .eq(Match::getStatus, "scheduled")
                .gt(Match::getMatchDate, LocalDateTime.now())
                .orderByAsc(Match::getMatchDate)
                .last("LIMIT " + limit));
    }

    @Override
    public List<Match> recent(int limit) {
        return matchMapper.selectList(new LambdaQueryWrapper<Match>()
                .in(Match::getStatus, "finished", "live")
                .le(Match::getMatchDate, LocalDateTime.now())
                .orderByDesc(Match::getMatchDate)
                .last("LIMIT " + limit));
    }

    @Override
    public Match save(MatchSaveDTO dto) {
        Match match;
        if (StringUtils.hasText(dto.getId())) {
            match = matchMapper.selectById(dto.getId());
            if (match == null) {
                throw new BusinessException(404, "比赛不存在");
            }
        } else {
            match = new Match();
            match.setId(UUID.randomUUID().toString().replace("-", ""));
            match.setStatus("scheduled");
            match.setScoreHome(0);
            match.setScoreAway(0);
            match.setHomeAway("home");
        }
        BeanUtils.copyProperties(dto, match);
        if (StringUtils.hasText(dto.getId())) {
            matchMapper.updateById(match);
        } else {
            matchMapper.insert(match);
        }
        return match;
    }

    @Override
    public void updateScore(String id, int scoreHome, int scoreAway) {
        Match match = matchMapper.selectById(id);
        if (match == null) {
            throw new BusinessException(404, "比赛不存在");
        }
        match.setScoreHome(scoreHome);
        match.setScoreAway(scoreAway);
        matchMapper.updateById(match);
    }

    @Override
    public void remove(String id) {
        matchMapper.deleteById(id);
    }
}
