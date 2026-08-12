package com.football.app.service.impl;

import com.football.app.common.exception.BusinessException;
import com.football.app.model.entity.Team;
import com.football.app.repository.TeamMapper;
import com.football.app.service.TeamService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

/**
 * 球队服务实现
 */
@Service
public class TeamServiceImpl implements TeamService {

    private final TeamMapper teamMapper;

    public TeamServiceImpl(TeamMapper teamMapper) {
        this.teamMapper = teamMapper;
    }

    @Override
    public List<Team> listAll() {
        return teamMapper.selectList(null);
    }

    @Override
    public Team get(String id) {
        Team team = teamMapper.selectById(id);
        if (team == null) {
            throw new BusinessException(404, "球队不存在");
        }
        return team;
    }

    @Override
    public Team save(Team team) {
        if (StringUtils.hasText(team.getId())) {
            teamMapper.updateById(team);
        } else {
            team.setId(UUID.randomUUID().toString().replace("-", ""));
            teamMapper.insert(team);
        }
        return team;
    }

    @Override
    public void remove(String id) {
        teamMapper.deleteById(id);
    }
}
