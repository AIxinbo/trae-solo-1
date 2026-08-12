package com.football.app.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MinIO 配置
 */
@Configuration
public class MinioConfig {

    @Value("${football.minio.endpoint}")
    private String endpoint;

    @Value("${football.minio.access-key}")
    private String accessKey;

    @Value("${football.minio.secret-key}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
