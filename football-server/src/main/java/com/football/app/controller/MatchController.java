package com.football.app.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.common.response.Result;
import com.football.app.model.dto.MatchSaveDTO;
import com.football.app.model.entity.Match;
import com.football.app.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 比赛接口
 */
@RestController
@RequestMapping("/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public Result<Page<Match>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return Result.success(matchService.page(current, size, status, keyword));
    }

    @GetMapping("/upcoming")
    public Result<List<Match>> upcoming(@RequestParam(defaultValue = "5") int limit) {
        return Result.success(matchService.upcoming(limit));
    }

    @GetMapping("/recent")
    public Result<List<Match>> recent(@RequestParam(defaultValue = "5") int limit) {
        return Result.success(matchService.recent(limit));
    }

    @GetMapping("/{id}")
    public Result<Match> get(@PathVariable String id) {
        return Result.success(matchService.get(id));
    }

    @PostMapping
    public Result<Match> save(@Valid @RequestBody MatchSaveDTO dto) {
        return Result.success(matchService.save(dto));
    }

    @PutMapping("/{id}")
    public Result<Match> update(@PathVariable String id, @Valid @RequestBody MatchSaveDTO dto) {
        dto.setId(id);
        return Result.success(matchService.save(dto));
    }

    @PutMapping("/{id}/score")
    public Result<Void> updateScore(@PathVariable String id,
                                    @RequestParam int scoreHome,
                                    @RequestParam int scoreAway) {
        matchService.updateScore(id, scoreHome, scoreAway);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        matchService.remove(id);
        return Result.success();
    }
}
