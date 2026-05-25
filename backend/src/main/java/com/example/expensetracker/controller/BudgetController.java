package com.example.expensetracker.controller;

import com.example.expensetracker.dto.BudgetDto;
import com.example.expensetracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDto> createBudget(@Valid @RequestBody BudgetDto dto) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(dto));
    }

    @PutMapping
    public ResponseEntity<BudgetDto> updateBudget(@Valid @RequestBody BudgetDto dto) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(dto));
    }

    @GetMapping
    public ResponseEntity<BudgetDto> getBudget(
            @RequestParam(value = "month", required = false) String month) {
        String queryMonth = (month == null || month.isBlank()) ? 
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")) : month;
        return ResponseEntity.ok(budgetService.getBudgetByMonth(queryMonth));
    }
}
