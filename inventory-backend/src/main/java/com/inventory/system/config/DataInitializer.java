package com.inventory.system.config;

import com.inventory.system.entities.User;
import com.inventory.system.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // Re-encode password with valid BCrypt hash for password123
            user.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user);
        }
    }
}
