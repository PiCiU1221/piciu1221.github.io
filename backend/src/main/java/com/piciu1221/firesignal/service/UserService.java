package com.piciu1221.firesignal.service;

import com.piciu1221.firesignal.LoginResponse;
import com.piciu1221.firesignal.model.Firefighter;
import com.piciu1221.firesignal.model.User;
import com.piciu1221.firesignal.repository.FirefighterRepository;
import com.piciu1221.firesignal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FirefighterRepository firefighterRepository;

    @Autowired
    public UserService(UserRepository userRepository, FirefighterRepository firefighterRepository) {
        this.userRepository = userRepository;
        this.firefighterRepository = firefighterRepository;
    }

    public LoginResponse loginUser(String username, String password) {
        // Find the user by the provided username
        User user = userRepository.findByUsername(username);

        if (user == null) {
            // User not found, return failure response
            return new LoginResponse(false, "User not found");
        }

        if (!user.getPassword().equals(password)) {
            // Incorrect password, return failure response
            return new LoginResponse(false, "Incorrect password");
        }

        // Login successful, return success response
        return new LoginResponse(true, "Login successful");
    }

    public String registerUser(String username, String password) {
        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null) {
            return "Username already exists";
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password);
        userRepository.save(newUser);

        return "User registered successfully";
    }

    public String getFirefighterName(String username) {
        Firefighter firefighter = firefighterRepository.findByFirefighterUsername(username);

        if (firefighter != null) {
            return firefighter.getFirefighterName();
        }

        return null; // Return null if no firefighter is found for the given username
    }
}
