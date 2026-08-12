package com.football.app.controller;

import com.football.app.common.response.Result;
import com.football.app.model.dto.TacticsSaveDTO;
import com.football.app.model.entity.TacticsLibrary;
import com.football.app.service.TacticsLibraryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 战术库接口
 */
@RestController
@RequestMapping("/tactics")
public class TacticsController {

    private final TacticsLibraryService tacticsService;

    public TacticsController(TacticsLibraryService tacticsService) {
        this.tacticsService = tacticsService;
    }

    @GetMapping
    public Result<List<TacticsLibrary>> list() {
        return Result.success(tacticsService.listAll());
    }

    @GetMapping("/{id}")
    public Result<TacticsLibrary> get(@PathVariable String id) {
        return Result.success(tacticsService.get(id));
    }

    @PostMapping
    public Result<TacticsLibrary> save(@Valid @RequestBody TacticsSaveDTO dto) {
        return Result.success(tacticsService.save(dto));
    }

    @PutMapping("/{id}")
    public Result<TacticsLibrary> update(@PathVariable String id, @Valid @RequestBody TacticsSaveDTO dto) {
        dto.setId(id);
        return Result.success(tacticsService.save(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        tacticsService.remove(id);
        return Result.success();
    }
}
