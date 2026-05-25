package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseDto;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.Role;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Category testCategory;
    private UserPrincipal userPrincipal;

    @BeforeEach
    public void setup() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role(Role.USER)
                .build();

        testCategory = Category.builder()
                .id(1L)
                .name("Food")
                .build();

        userPrincipal = new UserPrincipal(testUser);

        // Set up Mock Security Context
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    public void testCreateExpense_Success() {
        // Arrange
        ExpenseDto inputDto = ExpenseDto.builder()
                .title("Lunch")
                .amount(BigDecimal.valueOf(25.50))
                .expenseDate(LocalDate.now())
                .paymentMethod("CASH")
                .categoryId(1L)
                .build();

        Expense savedExpense = Expense.builder()
                .id(10L)
                .title("Lunch")
                .amount(BigDecimal.valueOf(25.50))
                .expenseDate(LocalDate.now())
                .paymentMethod("CASH")
                .category(testCategory)
                .user(testUser)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);
        when(budgetRepository.findByUserIdAndMonth(anyLong(), anyString())).thenReturn(Optional.empty());

        // Act
        ExpenseDto resultDto = expenseService.createExpense(inputDto);

        // Assert
        assertNotNull(resultDto);
        assertEquals(10L, resultDto.getId());
        assertEquals("Lunch", resultDto.getTitle());
        assertEquals(BigDecimal.valueOf(25.50), resultDto.getAmount());
        assertEquals("Food", resultDto.getCategoryName());
        assertNull(resultDto.getBudgetAlert());

        verify(expenseRepository, times(1)).save(any(Expense.class));
    }
}
