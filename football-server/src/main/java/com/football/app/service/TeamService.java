package com.football.app.service;

import com.football.app.model.entity.Team;

import java.util.List;

public interface TeamService {

    List<Team> listAll();

    Team get(String id);

    Team save(Team team);

    void remove(String id);
}
