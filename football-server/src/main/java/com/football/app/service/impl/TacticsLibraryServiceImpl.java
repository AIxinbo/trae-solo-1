package com.football.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.football.app.common.exception.BusinessException;
import com.football.app.model.dto.TacticsSaveDTO;
import com.football.app.model.entity.TacticsLibrary;
import com.football.app.repository.TacticsLibraryMapper;
import com.football.app.service.TacticsLibraryService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

/**
 * 战术库服务实现
 */
@Service
public class TacticsLibraryServiceImpl implements TacticsLibraryService {

    private final TacticsLibraryMapper tacticsLibraryMapper;

    public TacticsLibraryServiceImpl(TacticsLibraryMapper tacticsLibraryMapper) {
        this.tacticsLibraryMapper = tacticsLibraryMapper;
    }

    @Override
    public List<TacticsLibrary> listAll() {
        return tacticsLibraryMapper.selectList(new LambdaQueryWrapper<TacticsLibrary>()
                .orderByDesc(TacticsLibrary::getIsPreset));
    }

    @Override
    public TacticsLibrary get(String id) {
        TacticsLibrary tactics = tacticsLibraryMapper.selectById(id);
        if (tactics == null) {
            throw new BusinessException(404, "战术不存在");
        }
        return tactics;
    }

    @Override
    public TacticsLibrary save(TacticsSaveDTO dto) {
        TacticsLibrary tactics;
        if (StringUtils.hasText(dto.getId())) {
            tactics = tacticsLibraryMapper.selectById(dto.getId());
            if (tactics == null) {
                throw new BusinessException(404, "战术不存在");
            }
        } else {
            tactics = new TacticsLibrary();
            tactics.setId(UUID.randomUUID().toString().replace("-", ""));
            tactics.setIsPreset(0);
        }
        BeanUtils.copyProperties(dto, tactics);
        if (StringUtils.hasText(dto.getId())) {
            tacticsLibraryMapper.updateById(tactics);
        } else {
            tacticsLibraryMapper.insert(tactics);
        }
        return tactics;
    }

    @Override
    public void remove(String id) {
        TacticsLibrary tactics = tacticsLibraryMapper.selectById(id);
        if (tactics != null && tactics.getIsPreset() == 1) {
            throw new BusinessException("预设战术不可删除");
        }
        tacticsLibraryMapper.deleteById(id);
    }
}
