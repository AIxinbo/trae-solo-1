# football-deploy

数智绿茵平台部署仓库，统一管理 Docker Compose 配置、Nginx 反向代理、数据库初始化脚本和部署脚本。

## 目录结构

```
football-deploy/
├── docker-compose.yml              # 基础配置（所有服务的基线）
├── docker-compose.infra.yml        # 仅基础设施模式（postgres/redis/minio/milvus）
├── docker-compose.dev.yml          # 全栈开发模式（源码挂载 + 热重载）
├── docker-compose.prod.yml         # 生产环境模式（打包镜像 + HTTPS）
├── .env.example                    # 环境变量模板
├── nginx/
│   ├── nginx.conf                  # Nginx 主配置
│   └── conf.d/
│       ├── dev.conf                # 开发环境 HTTP 配置
│       └── prod.conf.example       # 生产环境 HTTPS 配置示例
├── sql/
│   └── init.sql                    # 数据库初始化脚本（15 张表 + 初始数据）
├── scripts/
│   └── deploy.sh                   # 一键部署脚本
└── docs/
    └── architecture.md             # 架构说明文档
```

## 关联项目

| 项目 | 说明 | 容器 | 端口 |
|------|------|------|------|
| football-os | 前端 (Vite + React 19 + TS) | frontend | 5173 |
| football-server | Java 业务后端 (Spring Boot 3) | backend | 8080 |
| football-ai | Python AI 服务 (FastAPI) | ai | 8000 |
| football-deploy | 本仓库（部署配置） | nginx + 4 基础设施 | 80/443 |

## 快速开始

### 1. 准备环境变量

```bash
cd football-deploy
cp .env.example .env
# 编辑 .env，修改密码和密钥
```

### 2. 启动方式

```bash
# 方式一：仅启动基础设施（独立开发前端或后端时用）
./scripts/deploy.sh infra

# 方式二：全栈本地开发（源码挂载 + 热重载）
./scripts/deploy.sh dev

# 方式三：生产环境部署
./scripts/deploy.sh prod
```

### 3. 其他命令

```bash
./scripts/deploy.sh stop              # 停止所有服务
./scripts/deploy.sh clean             # 停止并清理所有数据卷（谨慎）
./scripts/deploy.sh logs              # 查看所有服务日志
./scripts/deploy.sh logs backend      # 查看指定服务日志
```

## 容器架构

```
                    ┌─────────────┐
                    │   Nginx     │ :80/:443
                    └──────┬──────┘
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐
      │ Frontend │  │ Backend  │  │    AI    │
      │  (Vite)  │  │ (Spring) │  │(FastAPI) │
      │  :5173   │  │  :8080   │  │  :8000   │
      └──────────┘  └────┬─────┘  └────┬─────┘
                         │              │
        ┌────────────────┼──────────────┼────────┐
        ▼                ▼              ▼        ▼
   ┌──────────┐   ┌──────────┐  ┌──────────┐ ┌──────────┐
   │PostgreSQL│   │  Redis   │  │  MinIO   │ │  Milvus  │
   │  :5432   │   │  :6379   │  │  :9000   │ │  :19530  │
   └──────────┘   └──────────┘  └──────────┘ └─────┬────┘
                                                    │
                                              ┌──────────┐
                                              │  etcd    │
                                              │  :2379   │
                                              └──────────┘
```

## 数据库

- **PostgreSQL 16** - 主数据库，业务数据
- **Redis 7** - 缓存、会话、实时数据
- **MinIO** - 对象存储（视频、图片）
- **Milvus 2.4** - 向量数据库（AI 检索）

初始化脚本 `sql/init.sql` 会在 PostgreSQL 首次启动时自动执行，创建 15 张业务表和初始数据。
