package com.LivingHistory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.LivingHistory")
public class LivingHistoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(LivingHistoryApplication.class, args);
    }
}
