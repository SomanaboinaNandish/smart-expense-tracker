package com.example.expensetracker.config;

import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Role;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Preload Expense Categories
        List<String> categories = Arrays.asList(
                "Food", "Travel", "Shopping", "Bills", 
                "Entertainment", "Health", "Education", "Others"
        );

        for (String name : categories) {
            if (categoryRepository.findByName(name).isEmpty()) {
                categoryRepository.save(Category.builder().name(name).build());
            }
        }

        // 2. Preload Demo Users
        if (!userRepository.existsByEmail("admin@expense.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@expense.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("user@expense.com")) {
            User user = User.builder()
                    .name("Test User")
                    .email("user@expense.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
        }
    }
}
