package com.example.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBreakdownDto {
    private String categoryName;
    private BigDecimal amount;
    private double percentage;
}
