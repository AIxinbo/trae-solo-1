package com.football.app.controller;

import com.football.app.common.response.Result;
import com.football.app.model.entity.Injury;
import com.football.app.service.InjuryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 伤病接口
 */
@RestController
@RequestMapping("/injuries")
public class InjuryController {

    private final InjuryService injuryService;

    public InjuryController(InjuryService injuryService) {
        this.injuryService = injuryService;
    }

    @GetMapping
    public Result<List<Injury>> active() {
        return Result.success(injuryService.active());
    }

    @GetMapping("/player/{playerId}")
    public Result<List<Injury>> listByPlayer(@PathVariable String playerId) {
        return Result.success(injuryService.listByPlayer(playerId));
    }

    @GetMapping("/{id}")
    public Result<Injury> get(@PathVariable String id) {
        return Result.success(injuryService.get(id));
    }

    @PostMapping
    public Result<Injury> save(@RequestBody Injury injury) {
        return Result.success(injuryService.save(injury));
    }

    @PutMapping("/{id}/recover")
    public Result<Void> recover(@PathVariable String id) {
        injuryService.recover(id);
        return Result.success();
    }
}
