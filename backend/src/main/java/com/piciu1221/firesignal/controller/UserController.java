package com.piciu1221.firesignal.controller;

import com.piciu1221.firesignal.dto.FirefighterDTO;
import com.piciu1221.firesignal.dto.UserDTO;
import com.piciu1221.firesignal.dto.UsernameDTO;
import com.piciu1221.firesignal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/validate-user")
    public ResponseEntity<Boolean> validateUser(@RequestBody UserDTO userDTO) {
        boolean isValid = userService.loginUser(userDTO.getUsername(), userDTO.getPassword()).isSuccess();
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/register-user")
    public ResponseEntity<String> registerUser(@RequestBody UserDTO userDTO) {
        userService.registerUser(userDTO.getUsername(), userDTO.getPassword());
        return ResponseEntity.ok("User registered successfully.");
    }

    @PostMapping("/get-firefighter-name")
    public ResponseEntity<FirefighterDTO> getFirefighterName(@RequestBody UsernameDTO usernameDTO) {
        String firefighterName = userService.getFirefighterName(usernameDTO.getUsername());
        FirefighterDTO firefighterDTO = new FirefighterDTO(firefighterName);
        return ResponseEntity.ok(firefighterDTO);
    }
}
