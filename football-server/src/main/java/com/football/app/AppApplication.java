package com.football.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 数智绿茵 业务后端启动类
 */
@SpringBootApplication
@MapperScan("com.football.app.repository")
@EnableScheduling
public class AppApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
        System.out.println("""

                ===================================================
                  数智绿茵 业务后端启动成功
                  API: http://localhost:8080/api/v1
                  文档: http://localhost:8080/api/v1/doc.html
                ===================================================
                """);
    }
}
