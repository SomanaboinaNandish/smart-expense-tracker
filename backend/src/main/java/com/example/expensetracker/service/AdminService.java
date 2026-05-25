package com.example.expensetracker.service;

import com.example.expensetracker.dto.AdminStatsDto;
import com.example.expensetracker.dto.UserProfileResponse;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.BadRequestException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserProfileResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getSystemStats() {
        long totalUsers = userRepository.count();
        long totalExpenses = expenseRepository.countTotalExpenses();
        BigDecimal totalPlatformSpending = expenseRepository.sumAllExpenses();
        long totalBudgets = budgetRepository.count();

        return AdminStatsDto.builder()
                .totalUsersCount(totalUsers)
                .totalExpensesCount(totalExpenses)
                .totalPlatformSpending(totalPlatformSpending)
                .activeBudgetsCount(totalBudgets)
                .build();
    }

    @Transactional
    public void deleteUser(Long id) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal.getId().equals(id)) {
            throw new BadRequestException("You cannot delete your own admin account!");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        userRepository.delete(user);
    }
}
