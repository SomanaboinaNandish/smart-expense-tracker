package com.example.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long id;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.01", message = "Monthly limit must be greater than zero")
    private BigDecimal monthlyLimit;

    @NotBlank(message = "Month is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Month must be in YYYY-MM format")
    private String month;

    private BigDecimal currentExpenses;
    private BigDecimal remainingBalance;
    private double usagePercentage;
}
