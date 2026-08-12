package com.football.app.controller;

import com.football.app.common.response.Result;
import com.football.app.model.entity.Team;
import com.football.app.service.TeamService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 球队接口
 */
@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public Result<List<Team>> list() {
        return Result.success(teamService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Team> get(@PathVariable String id) {
        return Result.success(teamService.get(id));
    }

    @PostMapping
    public Result<Team> save(@RequestBody Team team) {
        return Result.success(teamService.save(team));
    }

    @PutMapping("/{id}")
    public Result<Team> update(@PathVariable String id, @RequestBody Team team) {
        team.setId(id);
        return Result.success(teamService.save(team));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        teamService.remove(id);
        return Result.success();
    }
}
