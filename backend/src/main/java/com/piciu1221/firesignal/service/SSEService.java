package com.piciu1221.firesignal.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.FluxSink;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SSEService {

    private final Map<String, FluxSink<String>> userSinkMap = new ConcurrentHashMap<>();

    public void addUserSink(String username, FluxSink<String> sink) {
        userSinkMap.put(username, sink);
    }

    public void removeUserSink(String username) {
        userSinkMap.remove(username);
    }

    public void sendSseMessageToUser(String username, String message) {
        FluxSink<String> sink = userSinkMap.get(username);
        if (sink != null) {
            sink.next(message);
        }
    }
}
