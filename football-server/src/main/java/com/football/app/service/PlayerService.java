package com.football.app.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.model.dto.PlayerSaveDTO;
import com.football.app.model.entity.Player;

import java.util.List;

public interface PlayerService {

    Page<Player> page(int current, int size, String keyword, String pos);

    Player get(String id);

    List<Player> listAll();

    Player save(PlayerSaveDTO dto);

    void remove(String id);
}
