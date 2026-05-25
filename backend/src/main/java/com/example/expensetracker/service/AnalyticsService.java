package com.example.expensetracker.service;

import com.example.expensetracker.dto.AnalyticsSummaryDto;
import com.example.expensetracker.dto.CategoryBreakdownDto;
import com.example.expensetracker.dto.MonthlyTrendDto;
import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    private Long getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getAnalyticsSummary(String monthStr) {
        Long userId = getCurrentUserId();
        
        // Default to current month if null/empty
        final String month = (monthStr == null || monthStr.isBlank()) ? 
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")) : monthStr;

        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthVal = Integer.parseInt(parts[1]);
        LocalDate startDate = LocalDate.of(year, monthVal, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // 1. Total expenses for the month
        BigDecimal totalExpenses = expenseRepository.sumExpensesByUserIdAndDateRange(userId, startDate, endDate);

        // 2. Budget limit for the month
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndMonth(userId, month);
        BigDecimal budgetLimit = budgetOpt.map(Budget::getMonthlyLimit).orElse(BigDecimal.ZERO);

        // 3. Calculate remaining balance & usage percentage
        BigDecimal remainingBudget = budgetLimit.subtract(totalExpenses);
        double budgetUsagePercentage = 0.0;
        if (budgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsagePercentage = totalExpenses.multiply(BigDecimal.valueOf(100))
                    .divide(budgetLimit, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // 4. Category-wise breakdowns
        List<Object[]> categorySums = expenseRepository.sumExpensesByCategory(userId, startDate, endDate);
        List<CategoryBreakdownDto> breakdowns = new ArrayList<>();
        BigDecimal highestAmount = BigDecimal.ZERO;
        String highestCategoryName = "None";

        for (Object[] row : categorySums) {
            String catName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            
            double percentage = 0.0;
            if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount.multiply(BigDecimal.valueOf(100))
                        .divide(totalExpenses, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            breakdowns.add(new CategoryBreakdownDto(catName, amount, percentage));

            if (amount.compareTo(highestAmount) > 0) {
                highestAmount = amount;
                highestCategoryName = catName;
            }
        }

        // 5. Monthly trends
        List<Object[]> trendsRaw = expenseRepository.sumExpensesMonthlyTrend(userId);
        List<MonthlyTrendDto> trends = trendsRaw.stream()
                .map(row -> {
                    Integer y = (Integer) row[0];
                    Integer m = (Integer) row[1];
                    BigDecimal amt = (BigDecimal) row[2];
                    String label = String.format("%d-%02d", y, m);
                    return new MonthlyTrendDto(label, amt);
                })
                .collect(Collectors.toList());

        return AnalyticsSummaryDto.builder()
                .totalExpenses(totalExpenses)
                .monthlyBudgetLimit(budgetLimit)
                .remainingBudget(remainingBudget)
                .budgetUsagePercentage(budgetUsagePercentage)
                .highestCategoryName(highestCategoryName)
                .highestCategoryAmount(highestAmount)
                .categoryBreakdowns(breakdowns)
                .monthlyTrends(trends)
                .build();
    }
}
