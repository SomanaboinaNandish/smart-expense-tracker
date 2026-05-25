package com.example.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    private String month; // Format: "YYYY-MM"
    private BigDecimal amount;
}
