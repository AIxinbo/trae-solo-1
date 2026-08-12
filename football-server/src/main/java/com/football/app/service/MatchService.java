package com.football.app.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.model.dto.MatchSaveDTO;
import com.football.app.model.entity.Match;

import java.util.List;

public interface MatchService {

    Page<Match> page(int current, int size, String status, String keyword);

    Match get(String id);

    List<Match> upcoming(int limit);

    List<Match> recent(int limit);

    Match save(MatchSaveDTO dto);

    void updateScore(String id, int scoreHome, int scoreAway);

    void remove(String id);
}
