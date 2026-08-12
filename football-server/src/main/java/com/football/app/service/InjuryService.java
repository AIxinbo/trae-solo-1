package com.football.app.service;

import com.football.app.model.entity.Injury;

import java.util.List;

public interface InjuryService {

    List<Injury> listByPlayer(String playerId);

    List<Injury> active();

    Injury get(String id);

    Injury save(Injury injury);

    void recover(String id);
}
