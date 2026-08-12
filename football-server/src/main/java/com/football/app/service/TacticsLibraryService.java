package com.football.app.service;

import com.football.app.model.dto.TacticsSaveDTO;
import com.football.app.model.entity.TacticsLibrary;

import java.util.List;

public interface TacticsLibraryService {

    List<TacticsLibrary> listAll();

    TacticsLibrary get(String id);

    TacticsLibrary save(TacticsSaveDTO dto);

    void remove(String id);
}
