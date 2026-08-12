package com.football.app.service;

import com.football.app.model.dto.FormationSaveDTO;
import com.football.app.model.entity.Formation;
import com.football.app.model.vo.FormationDetailVO;

import java.util.List;

public interface FormationService {

    List<Formation> listAll();

    FormationDetailVO detail(String id);

    Formation save(FormationSaveDTO dto);

    void remove(String id);
}
