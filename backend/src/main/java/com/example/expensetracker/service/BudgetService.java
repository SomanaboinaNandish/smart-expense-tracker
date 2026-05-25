package com.example.expensetracker.service;

import com.example.expensetracker.dto.BudgetDto;
import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.entity.User;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }

    private User getCurrentUserEntity() {
        return userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public BudgetDto createOrUpdateBudget(BudgetDto dto) {
        Long userId = getCurrentUserId();
        Optional<Budget> existing = budgetRepository.findByUserIdAndMonth(userId, dto.getMonth());
        
        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setMonthlyLimit(dto.getMonthlyLimit());
        } else {
            budget = Budget.builder()
                    .monthlyLimit(dto.getMonthlyLimit())
                    .month(dto.getMonth())
                    .user(getCurrentUserEntity())
                    .build();
        }

        Budget saved = budgetRepository.save(budget);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public BudgetDto getBudgetByMonth(String month) {
        Long userId = getCurrentUserId();
        Budget budget = budgetRepository.findByUserIdAndMonth(userId, month)
                .orElse(Budget.builder()
                        .monthlyLimit(BigDecimal.ZERO)
                        .month(month)
                        .build());
        return convertToDto(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetDto> getAllBudgets() {
        Long userId = getCurrentUserId();
        return budgetRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BudgetDto convertToDto(Budget budget) {
        if (budget.getId() == null) {
            // Budget doesn't exist yet, return empty defaults
            return BudgetDto.builder()
                    .monthlyLimit(BigDecimal.ZERO)
                    .month(budget.getMonth())
                    .currentExpenses(BigDecimal.ZERO)
                    .remainingBalance(BigDecimal.ZERO)
                    .usagePercentage(0.0)
                    .build();
        }

        // Calculate start and end dates of the budget month
        String[] parts = budget.getMonth().split("-");
        int year = Integer.parseInt(parts[0]);
        int monthVal = Integer.parseInt(parts[1]);
        LocalDate startDate = LocalDate.of(year, monthVal, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        BigDecimal currentExpenses = expenseRepository.sumExpensesByUserIdAndDateRange(budget.getUser().getId(), startDate, endDate);
        BigDecimal remaining = budget.getMonthlyLimit().subtract(currentExpenses);

        double usagePercentage = 0.0;
        if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = currentExpenses.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getMonthlyLimit(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return BudgetDto.builder()
                .id(budget.getId())
                .monthlyLimit(budget.getMonthlyLimit())
                .month(budget.getMonth())
                .currentExpenses(currentExpenses)
                .remainingBalance(remaining)
                .usagePercentage(usagePercentage)
                .build();
    }
}
