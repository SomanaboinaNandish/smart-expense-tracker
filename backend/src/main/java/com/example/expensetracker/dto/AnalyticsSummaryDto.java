package com.example.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {
    private BigDecimal totalExpenses;
    private BigDecimal monthlyBudgetLimit;
    private BigDecimal remainingBudget;
    private double budgetUsagePercentage;
    private String highestCategoryName;
    private BigDecimal highestCategoryAmount;
    private List<CategoryBreakdownDto> categoryBreakdowns;
    private List<MonthlyTrendDto> monthlyTrends;
}
