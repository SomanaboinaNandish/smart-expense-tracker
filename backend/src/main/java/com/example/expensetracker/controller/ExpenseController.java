package com.example.expensetracker.controller;

import com.example.expensetracker.dto.ExpenseDto;
import com.example.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@Valid @RequestBody ExpenseDto dto) {
        return new ResponseEntity<>(expenseService.createExpense(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ExpenseDto>> getExpenses(
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "expenseDate") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        return ResponseEntity.ok(expenseService.getFilteredExpenses(
                startDate, endDate, categoryId, minAmount, maxAmount, query, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDto> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportExpenses(
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount) {

        List<ExpenseDto> list = expenseService.getFilteredExpensesNoPagination(
                startDate, endDate, categoryId, minAmount, maxAmount);

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Title,Description,Amount,Date,Payment Method,Category,Created At\n");
        for (ExpenseDto e : list) {
            String cleanTitle = e.getTitle() != null ? e.getTitle().replace("\"", "\"\"") : "";
            String cleanDesc = e.getDescription() != null ? e.getDescription().replace("\"", "\"\"") : "";
            csv.append(e.getId()).append(",")
                    .append("\"").append(cleanTitle).append("\",")
                    .append("\"").append(cleanDesc).append("\",")
                    .append(e.getAmount()).append(",")
                    .append(e.getExpenseDate()).append(",")
                    .append(e.getPaymentMethod()).append(",")
                    .append(e.getCategoryName()).append(",")
                    .append(e.getCreatedAt()).append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=expenses.csv")
                .header("Content-Type", "text/csv")
                .body(csv.toString());
    }
}
