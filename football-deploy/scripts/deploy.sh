#!/bin/bash
# ============================================================
# 数智绿茵 一键部署脚本
# 用法: ./scripts/deploy.sh {infra|dev|prod}
# ============================================================
set -e

COMPOSE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$COMPOSE_DIR"

ENV=${1:-dev}
PROJECT_PREFIX=${PROJECT_PREFIX:-football}

echo "=== 数智绿茵 部署 ($ENV) ==="

# 检查 .env
if [ ! -f .env ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "[警告] 已从 .env.example 创建 .env，请修改其中的密码和密钥后重新运行。"
    echo "[提示] 生产环境务必修改 JWT_SECRET / DB_PASS / REDIS_PASS / MINIO_ROOT_PASS"
    exit 1
fi

# 检查 docker
if ! command -v docker &> /dev/null; then
    echo "[错误] 未检测到 docker，请先安装 Docker。"
    exit 1
fi

case $ENV in
    infra)
        echo ">>> 启动基础设施（postgres / redis / minio / milvus）..."
        docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.infra.yml up -d
        ;;
    dev)
        echo ">>> 启动全栈开发环境（源码挂载 + 热重载）..."
        docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.dev.yml up -d
        ;;
    prod)
        echo ">>> 启动生产环境..."
        # 生产环境检查 SSL 证书
        if [ ! -f nginx/ssl/fullchain.pem ]; then
            echo "[警告] 未找到 SSL 证书 (nginx/ssl/fullchain.pem)，将使用 dev.conf"
            echo "[提示] 生产环境请配置 SSL 证书并将 nginx/conf.d/prod.conf.example 重命名为 prod.conf"
        fi
        docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.prod.yml up -d
        ;;
    stop)
        echo ">>> 停止所有服务..."
        docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.dev.yml down
        exit 0
        ;;
    clean)
        echo ">>> 停止并清理数据卷（危险操作）..."
        read -p "确认清理所有数据？(yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.dev.yml down -v
            echo ">>> 已清理所有数据和卷"
        else
            echo ">>> 已取消"
        fi
        exit 0
        ;;
    logs)
        SERVICE=${2:-}
        if [ -z "$SERVICE" ]; then
            docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.dev.yml logs -f --tail=100
        else
            docker compose -p "$PROJECT_PREFIX" -f docker-compose.yml -f docker-compose.dev.yml logs -f --tail=100 "$SERVICE"
        fi
        exit 0
        ;;
    *)
        echo "用法: $0 {infra|dev|prod|stop|clean|logs [service]}"
        echo ""
        echo "  infra  - 仅启动基础设施（数据库等），用于独立开发前端或后端"
        echo "  dev    - 全栈本地开发（源码挂载 + 热重载）"
        echo "  prod   - 生产环境部署（打包镜像）"
        echo "  stop   - 停止所有服务"
        echo "  clean  - 停止并清理所有数据卷（谨慎使用）"
        echo "  logs [service] - 查看日志，可选指定服务名"
        exit 1
        ;;
esac

echo ""
echo "=== 部署完成 ==="
docker compose -p "$PROJECT_PREFIX" ps
