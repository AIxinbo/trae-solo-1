package com.football.app.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.football.app.common.response.Result;
import com.football.app.model.dto.PlayerSaveDTO;
import com.football.app.model.entity.Player;
import com.football.app.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 球员接口
 */
@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public Result<Page<Player>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String pos) {
        return Result.success(playerService.page(current, size, keyword, pos));
    }

    @GetMapping("/all")
    public Result<List<Player>> all() {
        return Result.success(playerService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Player> get(@PathVariable String id) {
        return Result.success(playerService.get(id));
    }

    @PostMapping
    public Result<Player> save(@Valid @RequestBody PlayerSaveDTO dto) {
        return Result.success(playerService.save(dto));
    }

    @PutMapping("/{id}")
    public Result<Player> update(@PathVariable String id, @Valid @RequestBody PlayerSaveDTO dto) {
        dto.setId(id);
        return Result.success(playerService.save(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        playerService.remove(id);
        return Result.success();
    }
}
