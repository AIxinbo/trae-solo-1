package com.football.app.controller;

import com.football.app.common.response.Result;
import com.football.app.model.dto.FormationSaveDTO;
import com.football.app.model.entity.Formation;
import com.football.app.model.vo.FormationDetailVO;
import com.football.app.service.FormationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 阵型接口
 */
@RestController
@RequestMapping("/formations")
public class FormationController {

    private final FormationService formationService;

    public FormationController(FormationService formationService) {
        this.formationService = formationService;
    }

    @GetMapping
    public Result<List<Formation>> list() {
        return Result.success(formationService.listAll());
    }

    @GetMapping("/{id}")
    public Result<FormationDetailVO> detail(@PathVariable String id) {
        return Result.success(formationService.detail(id));
    }

    @PostMapping
    public Result<Formation> save(@Valid @RequestBody FormationSaveDTO dto) {
        return Result.success(formationService.save(dto));
    }

    @PutMapping("/{id}")
    public Result<Formation> update(@PathVariable String id, @Valid @RequestBody FormationSaveDTO dto) {
        dto.setId(id);
        return Result.success(formationService.save(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        formationService.remove(id);
        return Result.success();
    }
}
