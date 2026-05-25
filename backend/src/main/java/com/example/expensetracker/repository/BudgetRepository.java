package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserIdAndMonth(Long userId, String month);
    List<Budget> findByUserId(Long userId);
}
