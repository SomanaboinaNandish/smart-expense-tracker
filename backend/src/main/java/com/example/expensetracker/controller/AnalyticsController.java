package com.example.expensetracker.controller;

import com.example.expensetracker.dto.AnalyticsSummaryDto;
import com.example.expensetracker.dto.CategoryBreakdownDto;
import com.example.expensetracker.dto.MonthlyTrendDto;
import com.example.expensetracker.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary(
            @RequestParam(value = "month", required = false) String month) {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary(month));
    }

    @GetMapping("/monthly")
    public ResponseEntity<AnalyticsSummaryDto> getMonthlyAnalytics(
            @RequestParam(value = "month", required = false) String month) {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary(month));
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategoryBreakdownDto>> getCategoryBreakdown(
            @RequestParam(value = "month", required = false) String month) {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary(month).getCategoryBreakdowns());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrends() {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary(null).getMonthlyTrends());
    }
}
