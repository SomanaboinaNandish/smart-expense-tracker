package com.example.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsersCount;
    private long totalExpensesCount;
    private BigDecimal totalPlatformSpending;
    private long activeBudgetsCount;
}
