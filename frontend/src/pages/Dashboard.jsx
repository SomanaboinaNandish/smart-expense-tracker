import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import { DollarSign, Wallet, Percent, Flame, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ setCurrentPage, showToast }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const summaryData = await api.analytics.getSummary(selectedMonth);
      setSummary(summaryData);
      
      const listData = await api.expenses.list({ page: 0, size: 5, sortBy: 'expenseDate', sortDir: 'desc' });
      setRecentExpenses(listData.content || []);
    } catch (err) {
      showToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  if (loading && !summary) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '1.2rem', fontWeight: 600 }}>Loading Dashboard...</div>;
  }

  // 1. Line Chart Config (Spending Trends)
  const lineChartData = {
    labels: summary?.monthlyTrends?.map(t => t.month).reverse() || [],
    datasets: [
      {
        label: 'Monthly Spending ($)',
        data: summary?.monthlyTrends?.map(t => t.amount).reverse() || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      x: { grid: { display: false } }
    }
  };

  // 2. Doughnut Chart Config (Category Distribution)
  const doughnutChartData = {
    labels: summary?.categoryBreakdowns?.map(c => c.categoryName) || [],
    datasets: [
      {
        data: summary?.categoryBreakdowns?.map(c => c.amount) || [],
        backgroundColor: [
          '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#f43f5e', '#a855f7'
        ],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.07)',
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#9b95b6', font: { family: 'Outfit', size: 12 } }
      }
    }
  };

  // Budget status evaluation
  const isBudgetExceeded = summary?.budgetUsagePercentage >= 100;
  const isBudgetWarning = summary?.budgetUsagePercentage >= 80 && summary?.budgetUsagePercentage < 100;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Financial Dashboard</h1>
          <p>Track, manage, and analyze your expenditures securely</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="month"
            className="filter-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Budget Limit Warnings banner */}
      {summary?.monthlyBudgetLimit > 0 && (isBudgetExceeded || isBudgetWarning) && (
        <div className={`alert-message-banner ${isBudgetExceeded ? 'critical' : ''}`}>
          <AlertTriangle size={20} />
          <span>
            {isBudgetExceeded 
              ? `Critical Alert: You have exceeded your monthly budget of $${summary.monthlyBudgetLimit} by $${Math.abs(summary.remainingBudget)}!`
              : `Warning: You have used ${summary.budgetUsagePercentage}% of your monthly budget limit ($${summary.monthlyBudgetLimit}).`}
          </span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <DollarSign size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Spent</span>
            <span className="metric-value">${summary?.totalExpenses?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className={`metric-card ${isBudgetExceeded ? 'alert-card' : ''}`}>
          <div className="metric-icon-box" style={{ 
            background: isBudgetExceeded ? 'rgba(239, 68, 68, 0.1)' : 'rgba(236, 72, 153, 0.1)', 
            color: isBudgetExceeded ? '#ef4444' : '#ec4899' 
          }}>
            <Wallet size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-label">{isBudgetExceeded ? 'Exceeded Budget' : 'Remaining Budget'}</span>
            <span className="metric-value" style={{ color: isBudgetExceeded ? '#ef4444' : 'inherit' }}>
              ${summary?.monthlyBudgetLimit > 0 ? Math.abs(summary.remainingBudget).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Percent size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Budget Used</span>
            <span className="metric-value">${summary?.monthlyBudgetLimit > 0 ? `${summary.budgetUsagePercentage.toFixed(1)}%` : '0%'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Flame size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Highest Category</span>
            <span className="metric-value" style={{ fontSize: '1.2rem', marginTop: 8 }}>
              {summary?.highestCategoryName && summary.highestCategoryName !== 'None'
                ? `${summary.highestCategoryName} ($${summary.highestCategoryAmount.toFixed(0)})` 
                : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="content-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Spending Trends</h3>
          </div>
          <div style={{ position: 'relative', height: '280px' }}>
            {summary?.monthlyTrends?.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} height={120} />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#645f7c' }}>No transaction history available</div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Category Breakdown</h3>
          </div>
          <div style={{ position: 'relative', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {summary?.categoryBreakdowns?.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div style={{ color: '#645f7c' }}>No transactions in selected month</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Transactions</h3>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setCurrentPage('expenses')}>
            View All <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="table-wrapper">
          {recentExpenses.length > 0 ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#645f7c' }}>{e.description}</div>
                    </td>
                    <td>{e.categoryName}</td>
                    <td>{new Date(e.expenseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <span className={`badge badge-${e.paymentMethod.toLowerCase()}`}>
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#f43f5e' }}>-${e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlignment: 'center', padding: '30px 0', color: '#645f7c', textAlign: 'center' }}>No expenses recorded yet. Get started by clicking Expenses in the sidebar!</div>
          )}
        </div>
      </div>
    </div>
  );
}
