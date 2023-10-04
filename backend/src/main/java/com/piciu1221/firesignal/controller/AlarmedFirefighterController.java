package com.piciu1221.firesignal.controller;

import com.piciu1221.firesignal.dto.AlarmActionDTO;
import com.piciu1221.firesignal.dto.AlarmInfoRequestDTO;
import com.piciu1221.firesignal.dto.ConsolidatedAlarmInfoDTO;
import com.piciu1221.firesignal.service.AlarmedFirefighterService;
import com.piciu1221.firesignal.service.SSEService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class AlarmedFirefighterController {
    @Autowired
    private AlarmedFirefighterService alarmedFirefighterService;

    @Autowired
    private SSEService sseService;

    @PostMapping("/get-consolidated-alarm-info")
    public ConsolidatedAlarmInfoDTO getConsolidatedInfo(@RequestBody AlarmInfoRequestDTO alarmInfoRequestDTO) {
        return alarmedFirefighterService.getConsolidatedAlarmInfo(alarmInfoRequestDTO.getAlarmId(), alarmInfoRequestDTO.getFirefighterUsername());
    }

    @GetMapping("/subscribe/{username}")
    public Flux<String> subscribeToAlarmedFirefighters(@PathVariable String username) {
        System.out.println("Subscribing to SSE for user: " + username);

        return Flux.create(sink -> {
            // Add the user's FluxSink to the map
            sseService.addUserSink(username, sink);

            sink.onDispose(() -> {
                // Remove the user's FluxSink from the map on disposal
                sseService.removeUserSink(username);

                // Print a message indicating that the connection has ended
                System.out.println("SSE connection ended for user: " + username);
            });
        });
    }

    @PostMapping("/accept-alarm")
    public ResponseEntity<?> acceptAlarmedFirefighter(@RequestBody AlarmActionDTO alarmActionDTO) {
        alarmedFirefighterService.acceptFirefighter(alarmActionDTO.getAlarmId(), alarmActionDTO.getFirefighterId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/decline-alarm")
    public ResponseEntity<?> declineAlarmedFirefighter(@RequestBody AlarmActionDTO alarmActionDTO) {
        alarmedFirefighterService.declineFirefighter(alarmActionDTO.getAlarmId(), alarmActionDTO.getFirefighterId());
        return ResponseEntity.ok().build();
    }

    /*
    @PostMapping("/get-alarmed-firefighters-count")
    public int getAlarmedFirefightersCount(@RequestBody AlarmInfoRequestDTO alarmInfoRequestDTO) {
        return alarmedFirefighterService.getAlarmedFirefightersCount(alarmInfoRequestDTO.getAlarmId(), alarmInfoRequestDTO.getFirefighterUsername());
    }

    @PostMapping("/has-accepted-commander")
    public boolean hasAcceptedCommander(@RequestBody AlarmInfoRequestDTO alarmInfoRequestDTO) {
        return alarmedFirefighterService.hasAcceptedCommander(alarmInfoRequestDTO.getAlarmId(), alarmInfoRequestDTO.getFirefighterUsername());
    }

    @PostMapping("/get-accepted-drivers-count")
    public int getAcceptedDriversCount(@RequestBody AlarmInfoRequestDTO alarmInfoRequestDTO) {
        return alarmedFirefighterService.getAcceptedDriversCount(alarmInfoRequestDTO.getAlarmId(), alarmInfoRequestDTO.getFirefighterUsername());
    }

    @PostMapping("/get-accepted-firefighters-count")
    public int getAcceptedFirefightersCount(@RequestBody AlarmInfoRequestDTO alarmInfoRequestDTO) {
        return alarmedFirefighterService.getAcceptedFirefightersCount(alarmInfoRequestDTO.getAlarmId(), alarmInfoRequestDTO.getFirefighterUsername());
    }

    @PostMapping("/has-accepted-technical-rescue")
    public boolean hasAcceptedTechnicalRescue(@RequestBody AlarmInfoRequestDTO alarmInfoRequestDTO) {
        return alarmedFirefighterService.hasAcceptedTechnicalRescue(alarmInfoRequestDTO.getAlarmId(), alarmInfoRequestDTO.getFirefighterUsername());
    }
    */

    /*
    @GetMapping("/test")
    public ResponseEntity<String> testSSE() {
        String message = "Id: 77" +
                ", City: Stargard" +
                ", Street: Wyszynskiego 10" +
                ", Description: Flames are visible from the windows on the upper floors. The roof is collapsing, and there is heavy smoke billowing from the structure. Occupants have evacuated the building, and the situation is critical.";

        sseService.sendSseMessageToUser("mdrogosz", message);

        return ResponseEntity.ok("Test alarm message sent: " + message);
    }
    */
}
