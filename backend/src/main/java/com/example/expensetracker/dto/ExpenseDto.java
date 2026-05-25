package com.example.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    private LocalDate expenseDate;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Custom warning alerts returned if the budget is exceeded or close to limit
    private String budgetAlert; 
}
