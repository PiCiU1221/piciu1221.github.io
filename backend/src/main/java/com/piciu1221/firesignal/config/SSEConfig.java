package com.piciu1221.firesignal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class SSEConfig {

    @Bean
    public Map<String, SseEmitter> sseEmitters() {
        return new ConcurrentHashMap<>();
    }
}