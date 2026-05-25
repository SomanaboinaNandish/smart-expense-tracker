package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND (:minAmount IS NULL OR e.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR e.amount <= :maxAmount) " +
           "AND (:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Expense> filterExpenses(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND (:minAmount IS NULL OR e.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR e.amount <= :maxAmount)")
    List<Expense> filterExpensesNoPagination(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount
    );

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e.category.name, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category.name")
    List<Object[]> sumExpensesByCategory(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Standard database-agnostic functions YEAR() and MONTH() grouping
    @Query("SELECT YEAR(e.expenseDate), MONTH(e.expenseDate), SUM(e.amount) " +
           "FROM Expense e WHERE e.user.id = :userId " +
           "GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) " +
           "ORDER BY YEAR(e.expenseDate) DESC, MONTH(e.expenseDate) DESC")
    List<Object[]> sumExpensesMonthlyTrend(@Param("userId") Long userId);

    @Query("SELECT COUNT(e) FROM Expense e")
    long countTotalExpenses();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumAllExpenses();
}
