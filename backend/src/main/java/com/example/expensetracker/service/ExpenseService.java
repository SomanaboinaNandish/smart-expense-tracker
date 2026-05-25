package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseDto;
import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.Role;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.exception.UnauthorizedException;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    private Long getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }

    private User getCurrentUserEntity() {
        return userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public ExpenseDto createExpense(ExpenseDto dto) {
        User currentUser = getCurrentUserEntity();
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        Expense expense = Expense.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .expenseDate(dto.getExpenseDate())
                .paymentMethod(dto.getPaymentMethod())
                .category(category)
                .user(currentUser)
                .build();

        Expense saved = expenseRepository.save(expense);
        
        // Convert to DTO and attach budget alerts if applicable
        ExpenseDto response = convertToDto(saved);
        response.setBudgetAlert(checkBudgetStatus(currentUser.getId(), saved.getExpenseDate()));
        return response;
    }

    @Transactional
    public ExpenseDto updateExpense(Long id, ExpenseDto dto) {
        User currentUser = getCurrentUserEntity();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        // Validate owner or admin role
        if (!expense.getUser().getId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new UnauthorizedException("You are not authorized to update this expense");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        expense.setTitle(dto.getTitle());
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setPaymentMethod(dto.getPaymentMethod());
        expense.setCategory(category);

        Expense saved = expenseRepository.save(expense);
        
        ExpenseDto response = convertToDto(saved);
        response.setBudgetAlert(checkBudgetStatus(expense.getUser().getId(), saved.getExpenseDate()));
        return response;
    }

    @Transactional
    public void deleteExpense(Long id) {
        User currentUser = getCurrentUserEntity();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        if (!expense.getUser().getId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new UnauthorizedException("You are not authorized to delete this expense");
        }

        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public ExpenseDto getExpenseById(Long id) {
        User currentUser = getCurrentUserEntity();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        if (!expense.getUser().getId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new UnauthorizedException("You are not authorized to view this expense");
        }

        return convertToDto(expense);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseDto> getFilteredExpenses(
            LocalDate startDate, LocalDate endDate, Long categoryId,
            BigDecimal minAmount, BigDecimal maxAmount, String query,
            int page, int size, String sortBy, String sortDir) {

        Long userId = getCurrentUserId();
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Expense> expensePage = expenseRepository.filterExpenses(
                userId, startDate, endDate, categoryId, minAmount, maxAmount, query, pageable);

        return expensePage.map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<ExpenseDto> getFilteredExpensesNoPagination(
            LocalDate startDate, LocalDate endDate, Long categoryId,
            BigDecimal minAmount, BigDecimal maxAmount) {
        
        Long userId = getCurrentUserId();
        List<Expense> list = expenseRepository.filterExpensesNoPagination(
                userId, startDate, endDate, categoryId, minAmount, maxAmount);
        
        return list.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private ExpenseDto convertToDto(Expense expense) {
        return ExpenseDto.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .paymentMethod(expense.getPaymentMethod())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }

    private String checkBudgetStatus(Long userId, LocalDate date) {
        String month = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndMonth(userId, month);

        if (budgetOpt.isPresent() && budgetOpt.get().getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
            Budget budget = budgetOpt.get();
            BigDecimal limit = budget.getMonthlyLimit();

            // Calculate start and end date
            LocalDate start = date.withDayOfMonth(1);
            LocalDate end = date.withDayOfMonth(date.lengthOfMonth());
            BigDecimal totalSpent = expenseRepository.sumExpensesByUserIdAndDateRange(userId, start, end);

            double usagePercent = totalSpent.multiply(BigDecimal.valueOf(100))
                    .divide(limit, 2, RoundingMode.HALF_UP)
                    .doubleValue();

            if (usagePercent >= 100.0) {
                return "CRITICAL: You have exceeded your monthly budget of $" + limit + "! (Spent: $" + totalSpent + ")";
            } else if (usagePercent >= 80.0) {
                return "WARNING: You have utilized " + usagePercent + "% of your monthly budget of $" + limit + ". (Spent: $" + totalSpent + ")";
            }
        }
        return null;
    }
}
