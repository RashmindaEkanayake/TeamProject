package com.inventory.system;

import com.inventory.system.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class InventoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }

    @Bean
    public CommandLineRunner initPasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByUsername("admin").ifPresent(user -> {
                user.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(user);
            });
            userRepository.findByUsername("salesrep").ifPresent(user -> {
                user.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(user);
            });
        };
    }
}
