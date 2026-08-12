-- ============================================================
-- 数智绿茵 数据库初始化脚本
-- PostgreSQL 16
-- ============================================================

-- 字符集与排序
SET client_encoding TO 'UTF8';

-- ============================================================
-- 1. 球员表
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
    id           VARCHAR(32) PRIMARY KEY,
    no           VARCHAR(8)  NOT NULL,
    name         VARCHAR(50) NOT NULL,
    pos_label    VARCHAR(20) NOT NULL,           -- 位置中文标签
    pos          VARCHAR(8)  NOT NULL,           -- 位置代码: GK/CB/RB/LB/DM/CM/CAM/RW/LW/ST
    rating       DECIMAL(3,1) DEFAULT 0,         -- 总评分
    rating_attack DECIMAL(3,1) DEFAULT 0,        -- 进攻
    rating_pass   DECIMAL(3,1) DEFAULT 0,        -- 传球
    rating_setpiece DECIMAL(3,1) DEFAULT 0,      -- 定位球
    rating_defense DECIMAL(3,1) DEFAULT 0,       -- 防守
    rating_speed  DECIMAL(3,1) DEFAULT 0,        -- 速度
    rating_physical DECIMAL(3,1) DEFAULT 0,      -- 身体
    health       VARCHAR(16) DEFAULT 'healthy',  -- healthy/injured/recovering
    health_note  VARCHAR(200),
    age          INT,
    height       INT,                            -- cm
    weight       INT,                            -- kg
    contract     VARCHAR(50),
    value        VARCHAR(20),
    rating_delta VARCHAR(50),                    -- 评分变化趋势
    is_deleted   SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_players_pos ON players(pos);
CREATE INDEX IF NOT EXISTS idx_players_no  ON players(no);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- ============================================================
-- 2. 阵型定义表
-- ============================================================
CREATE TABLE IF NOT EXISTS formations (
    id           VARCHAR(32) PRIMARY KEY,
    name         VARCHAR(20) NOT NULL,           -- 如 4-3-3
    label        VARCHAR(50),                    -- 显示名称
    summary      VARCHAR(100),                   -- 战术概述
    is_preset    SMALLINT DEFAULT 0,             -- 1=预设, 0=自定义
    positions    JSONB NOT NULL,                 -- 位置坐标 [{no,left,top,role,pos}]
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_formations_preset ON formations(is_preset);

-- ============================================================
-- 3. 战术库表
-- ============================================================
CREATE TABLE IF NOT EXISTS tactics_library (
    id           VARCHAR(32) PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    coach        VARCHAR(50),                    -- 名帅名称（预设）
    formation_id VARCHAR(32),
    description  TEXT,
    playbook     JSONB,                          -- 战术详细配置
    is_preset    SMALLINT DEFAULT 0,
    is_deleted   SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
);

-- ============================================================
-- 4. 比赛表
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
    id           VARCHAR(32) PRIMARY KEY,
    opponent     VARCHAR(100) NOT NULL,
    match_date   TIMESTAMP NOT NULL,
    venue        VARCHAR(100),
    home_away    VARCHAR(8) DEFAULT 'home',      -- home/away
    status       VARCHAR(16) DEFAULT 'scheduled', -- scheduled/live/finished
    score_home   INT DEFAULT 0,
    score_away   INT DEFAULT 0,
    formation_id VARCHAR(32),
    stats        JSONB,                          -- 比赛统计数据
    is_deleted   SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ============================================================
-- 5. 训练计划表
-- ============================================================
CREATE TABLE IF NOT EXISTS trainings (
    id           VARCHAR(32) PRIMARY KEY,
    title        VARCHAR(100) NOT NULL,
    train_date   DATE NOT NULL,
    start_time   VARCHAR(8),
    end_time     VARCHAR(8),
    location     VARCHAR(100),
    type         VARCHAR(32),                    -- tactical/physical/technical/recovery
    intensity    VARCHAR(16) DEFAULT 'medium',   -- low/medium/high
    content      JSONB,                          -- 训练内容详情
    attendance   JSONB,                          -- 出勤记录
    is_deleted   SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(train_date);

-- ============================================================
-- 6. 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id           VARCHAR(32) PRIMARY KEY,
    username     VARCHAR(50) UNIQUE NOT NULL,
    password     VARCHAR(200) NOT NULL,          -- bcrypt 加密
    real_name    VARCHAR(50),
    role         VARCHAR(20) DEFAULT 'coach',    -- admin/coach/analyst/player
    avatar       VARCHAR(200),
    phone        VARCHAR(20),
    email        VARCHAR(100),
    status       SMALLINT DEFAULT 1,             -- 1=启用, 0=禁用
    last_login   TIMESTAMP,
    is_deleted   SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================
-- 7. 球员比赛统计表
-- ============================================================
CREATE TABLE IF NOT EXISTS player_match_stats (
    id           VARCHAR(32) PRIMARY KEY,
    match_id     VARCHAR(32) NOT NULL,
    player_id    VARCHAR(32) NOT NULL,
    rating       DECIMAL(3,1),
    minutes      INT DEFAULT 0,
    goals        INT DEFAULT 0,
    assists      INT DEFAULT 0,
    passes       INT DEFAULT 0,
    pass_success INT DEFAULT 0,
    shots        INT DEFAULT 0,
    shots_on_target INT DEFAULT 0,
    distance_km  DECIMAL(5,2),
    sprint_count INT DEFAULT 0,
    stats        JSONB,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pms_match ON player_match_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_pms_player ON player_match_stats(player_id);

-- ============================================================
-- 8. 视频分析表
-- ============================================================
CREATE TABLE IF NOT EXISTS video_analyses (
    id           VARCHAR(32) PRIMARY KEY,
    match_id     VARCHAR(32),
    title        VARCHAR(200) NOT NULL,
    video_url    VARCHAR(500),
    thumbnail    VARCHAR(500),
    duration     INT,                            -- 秒
    status       VARCHAR(16) DEFAULT 'pending',  -- pending/processing/ready/failed
    ai_summary   TEXT,
    ai_tags      JSONB,                          -- AI 识别标签
    clips        JSONB,                          -- 精彩片段
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_va_match ON video_analyses(match_id);
CREATE INDEX IF NOT EXISTS idx_va_status ON video_analyses(status);

-- ============================================================
-- 9. 通知表
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id           VARCHAR(32) PRIMARY KEY,
    user_id      VARCHAR(32) NOT NULL,
    type         VARCHAR(32) NOT NULL,           -- match/training/player/system
    title        VARCHAR(200) NOT NULL,
    content      TEXT,
    is_read      SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

-- ============================================================
-- 10. 球队表
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
    id           VARCHAR(32) PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    short_name   VARCHAR(20),
    logo         VARCHAR(500),
    coach        VARCHAR(50),
    home_venue   VARCHAR(100),
    founded_year INT,
    is_deleted   SMALLINT DEFAULT 0,
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 11. AI 对话历史表
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id           VARCHAR(32) PRIMARY KEY,
    user_id      VARCHAR(32) NOT NULL,
    session_id   VARCHAR(32) NOT NULL,
    role         VARCHAR(16) NOT NULL,           -- user/assistant
    content      TEXT NOT NULL,
    tokens       INT,
    create_time  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_chat_session ON ai_chat_history(session_id, create_time);

-- ============================================================
-- 12. 训练出勤表
-- ============================================================
CREATE TABLE IF NOT EXISTS training_attendance (
    id           VARCHAR(32) PRIMARY KEY,
    training_id  VARCHAR(32) NOT NULL,
    player_id    VARCHAR(32) NOT NULL,
    status       VARCHAR(16) DEFAULT 'present',  -- present/absent/late/injured
    note         VARCHAR(200),
    load_index   DECIMAL(5,2),                   -- 训练负荷指数
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(training_id, player_id)
);

-- ============================================================
-- 13. 伤病记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS injuries (
    id           VARCHAR(32) PRIMARY KEY,
    player_id    VARCHAR(32) NOT NULL,
    injury_type  VARCHAR(50),
    description  VARCHAR(500),
    start_date   DATE NOT NULL,
    expected_return DATE,
    actual_return DATE,
    status       VARCHAR(16) DEFAULT 'active',   -- active/recovered/chronic
    create_time  TIMESTAMP DEFAULT NOW(),
    update_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_injuries_player ON injuries(player_id, status);

-- ============================================================
-- 14. 转会记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS transfers (
    id           VARCHAR(32) PRIMARY KEY,
    player_id    VARCHAR(32) NOT NULL,
    type         VARCHAR(8) NOT NULL,            -- in/out
    from_team    VARCHAR(100),
    to_team      VARCHAR(100),
    fee          DECIMAL(15,2),
    transfer_date DATE NOT NULL,
    note         VARCHAR(500),
    create_time  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- ============================================================
-- 15. 系统配置表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_config (
    config_key   VARCHAR(100) PRIMARY KEY,
    config_value TEXT,
    description  VARCHAR(200),
    update_time  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 初始数据：预设阵型
-- ============================================================
INSERT INTO formations (id, name, label, summary, is_preset, positions) VALUES
('f_433', '4-3-3', '4-3-3', '高位压迫 · 两翼齐飞', 1,
 '[{"no":1,"left":"7%","top":"50%","role":"gk","pos":"GK"},{"no":2,"left":"22%","top":"20%","role":"def","pos":"RB"},{"no":3,"left":"22%","top":"40%","role":"def","pos":"CB"},{"no":4,"left":"22%","top":"60%","role":"def","pos":"CB"},{"no":5,"left":"22%","top":"80%","role":"def","pos":"LB"},{"no":6,"left":"44%","top":"30%","role":"mid","pos":"DM"},{"no":10,"left":"44%","top":"50%","role":"mid","pos":"CAM"},{"no":8,"left":"44%","top":"70%","role":"mid","pos":"CM"},{"no":7,"left":"70%","top":"25%","role":"fwd","pos":"RW"},{"no":9,"left":"70%","top":"50%","role":"fwd","pos":"ST"},{"no":11,"left":"70%","top":"75%","role":"fwd","pos":"LW"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO formations (id, name, label, summary, is_preset, positions) VALUES
('f_4231', '4-2-3-1', '4-2-3-1', '中场控制 · 单箭头', 1,
 '[{"no":1,"left":"7%","top":"50%","role":"gk","pos":"GK"},{"no":2,"left":"22%","top":"20%","role":"def","pos":"RB"},{"no":3,"left":"22%","top":"40%","role":"def","pos":"CB"},{"no":4,"left":"22%","top":"60%","role":"def","pos":"CB"},{"no":5,"left":"22%","top":"80%","role":"def","pos":"LB"},{"no":6,"left":"40%","top":"38%","role":"mid","pos":"DM"},{"no":8,"left":"40%","top":"62%","role":"mid","pos":"DM"},{"no":7,"left":"60%","top":"25%","role":"fwd","pos":"RW"},{"no":10,"left":"60%","top":"50%","role":"mid","pos":"CAM"},{"no":11,"left":"60%","top":"75%","role":"fwd","pos":"LW"},{"no":9,"left":"78%","top":"50%","role":"fwd","pos":"ST"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO formations (id, name, label, summary, is_preset, positions) VALUES
('f_352', '3-5-2', '3-5-2', '边翼卫插上 · 双前锋', 1,
 '[{"no":1,"left":"7%","top":"50%","role":"gk","pos":"GK"},{"no":3,"left":"20%","top":"30%","role":"def","pos":"CB"},{"no":4,"left":"20%","top":"50%","role":"def","pos":"CB"},{"no":5,"left":"20%","top":"70%","role":"def","pos":"CB"},{"no":2,"left":"38%","top":"15%","role":"mid","pos":"RWB"},{"no":11,"left":"38%","top":"85%","role":"mid","pos":"LWB"},{"no":6,"left":"42%","top":"38%","role":"mid","pos":"CM"},{"no":10,"left":"42%","top":"50%","role":"mid","pos":"CAM"},{"no":8,"left":"42%","top":"62%","role":"mid","pos":"CM"},{"no":9,"left":"70%","top":"38%","role":"fwd","pos":"ST"},{"no":7,"left":"70%","top":"62%","role":"fwd","pos":"ST"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO formations (id, name, label, summary, is_preset, positions) VALUES
('f_442', '4-4-2', '4-4-2', '传统平行 · 攻守均衡', 1,
 '[{"no":1,"left":"7%","top":"50%","role":"gk","pos":"GK"},{"no":2,"left":"22%","top":"20%","role":"def","pos":"RB"},{"no":3,"left":"22%","top":"40%","role":"def","pos":"CB"},{"no":4,"left":"22%","top":"60%","role":"def","pos":"CB"},{"no":5,"left":"22%","top":"80%","role":"def","pos":"LB"},{"no":7,"left":"50%","top":"15%","role":"mid","pos":"RM"},{"no":6,"left":"50%","top":"40%","role":"mid","pos":"CM"},{"no":10,"left":"50%","top":"50%","role":"mid","pos":"CM"},{"no":8,"left":"50%","top":"60%","role":"mid","pos":"CM"},{"no":11,"left":"50%","top":"85%","role":"mid","pos":"LM"},{"no":9,"left":"75%","top":"40%","role":"fwd","pos":"ST"},{"no":21,"left":"75%","top":"60%","role":"fwd","pos":"ST"}]')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 初始数据：预设战术库（名帅风格）
-- ============================================================
INSERT INTO tactics_library (id, name, coach, formation_id, description, is_preset, playbook) VALUES
('tl_1', '瓜迪奥拉式传控', 'Pep Guardiola', 'f_433', '极致传控，高位压迫，边后卫内收', 1,
 '{"style":"tiki-taka","pressing":"high","tempo":"fast","width":"wide"}'),
('tl_2', '克洛普重金属足球', 'Jurgen Klopp', 'f_433', 'gegenpressing，快速反击，两翼齐飞', 1,
 '{"style":"gegenpressing","pressing":"very-high","tempo":"very-fast","width":"wide"}'),
('tl_3', '穆里尼奥防守反击', 'Jose Mourinho', 'f_4231', '低位防守，快速反击，单箭头', 1,
 '{"style":"counter-attack","pressing":"low","tempo":"fast","width":"narrow"}'),
('tl_4', '安切洛蒂均衡战术', 'Carlo Ancelotti', 'f_433', '攻守均衡，灵活变阵，明星球员自由发挥', 1,
 '{"style":"balanced","pressing":"medium","tempo":"medium","width":"balanced"}'),
('tl_5', '孔蒂三后卫体系', 'Antonio Conte', 'f_352', '3-5-2 体系，边翼卫插上，双前锋', 1,
 '{"style":"3-atb","pressing":"medium","tempo":"fast","width":"wide"}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 初始数据：默认管理员
-- ============================================================
INSERT INTO users (id, username, password, real_name, role) VALUES
('u_admin', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 初始数据：系统配置
-- ============================================================
INSERT INTO sys_config (config_key, config_value, description) VALUES
('team_name', '数智绿茵 FC', '球队名称'),
('season', '2026', '当前赛季'),
('match_duration', '90', '比赛时长（分钟）'),
('squad_size', '25', '一线队名额')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- 完成
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '数智绿茵数据库初始化完成';
END $$;
