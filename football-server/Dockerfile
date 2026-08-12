# ============================================================
# football-server Dockerfile（多阶段构建）
# ============================================================

# 阶段1：构建
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# 先复制 pom 加速依赖缓存
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# 复制源码并构建
COPY src ./src
RUN ./mvnw package -DskipTests -B

# 阶段2：运行
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 时区
RUN apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 复制 jar
COPY --from=builder /build/target/football-server.jar app.jar

# JVM 参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=10 --start-period=60s \
    CMD curl -f http://localhost:8080/api/v1/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
