# football-server

数智绿茵 业务后端（Java Spring Boot 3）

## 技术栈

- **Java 21** + **Spring Boot 3.3**
- **MyBatis-Plus 3.5** - ORM
- **PostgreSQL 16** - 主数据库
- **Redis 7** - 缓存
- **MinIO** - 对象存储
- **JWT** - 鉴权
- **Lombok** - 简化代码

## 分层架构

```
src/main/java/com/football/app/
├── AppApplication.java              # 启动类
├── config/                          # 配置层
│   ├── SecurityConfig.java          # Spring Security
│   ├── JwtAuthFilter.java           # JWT 过滤器
│   ├── MybatisPlusConfig.java       # MyBatis-Plus
│   ├── RedisConfig.java             # Redis
│   └── MinioConfig.java             # MinIO
├── controller/                      # 控制器层
│   ├── AuthController.java          # 认证
│   ├── PlayerController.java        # 球员
│   ├── FormationController.java     # 阵型
│   ├── TacticsController.java       # 战术库
│   └── HealthController.java        # 健康检查
├── service/                         # 服务层（接口）
│   └── impl/                        # 服务实现
├── repository/                      # 数据访问层（Mapper）
├── model/
│   ├── entity/                      # 实体
│   ├── dto/                         # 请求 DTO
│   └── vo/                          # 响应 VO
└── common/
    ├── exception/                   # 异常处理
    ├── response/                    # 统一响应
    └── util/                        # 工具类
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/auth/me` | 当前用户 |
| GET | `/api/v1/players` | 球员分页 |
| GET | `/api/v1/players/all` | 全部球员 |
| GET/POST/PUT/DELETE | `/api/v1/players/{id}` | 球员 CRUD |
| GET | `/api/v1/formations` | 阵型列表 |
| GET | `/api/v1/formations/{id}` | 阵型详情（含总分） |
| POST/PUT/DELETE | `/api/v1/formations/{id}` | 阵型 CRUD |
| GET | `/api/v1/tactics` | 战术库列表 |
| POST/PUT/DELETE | `/api/v1/tactics/{id}` | 战术库 CRUD |
| GET | `/api/v1/health` | 健康检查 |

## 本地开发

```bash
# 1. 启动基础设施
cd ../football-deploy && ./scripts/deploy.sh infra

# 2. 运行后端
cd ../football-server
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
