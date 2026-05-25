import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import { Calendar, TrendingUp, Grid, ShieldAlert } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.getSummary(selectedMonth);
      setSummary(data);
    } catch (err) {
      showToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedMonth]);

  if (loading && !summary) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '1.2rem', fontWeight: 600 }}>Loading Analytics...</div>;
  }

  // 1. Line Chart: Spending trends
  const lineChartData = {
    labels: summary?.monthlyTrends?.map(t => t.month).reverse() || [],
    datasets: [
      {
        label: 'Monthly Spending ($)',
        data: summary?.monthlyTrends?.map(t => t.amount).reverse() || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  };

  // 2. Bar Chart: Category aggregates
  const barChartData = {
    labels: summary?.categoryBreakdowns?.map(c => c.categoryName) || [],
    datasets: [
      {
        label: 'Amount Spent ($)',
        data: summary?.categoryBreakdowns?.map(c => c.amount) || [],
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
        hoverBackgroundColor: '#ec4899',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'var(--border-glass)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9b95b6' } },
      x: { grid: { display: false }, ticks: { color: '#9b95b6' } }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Analytics & Reports</h1>
          <p>Deeper insights into your historical spending trends</p>
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

      {/* Analytics Summary Stats Panel */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-details">
            <span className="metric-label" style={{ fontSize: '0.75rem' }}>Total Monthly Spent</span>
            <span className="metric-value" style={{ fontSize: '1.4rem' }}>${summary?.totalExpenses?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-details">
            <span className="metric-label" style={{ fontSize: '0.75rem' }}>Set Budget Limit</span>
            <span className="metric-value" style={{ fontSize: '1.4rem' }}>${summary?.monthlyBudgetLimit?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-details">
            <span className="metric-label" style={{ fontSize: '0.75rem' }}>Budget Used</span>
            <span className="metric-value" style={{ fontSize: '1.4rem' }}>
              {summary?.monthlyBudgetLimit > 0 ? `${summary.budgetUsagePercentage.toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-details">
            <span className="metric-label" style={{ fontSize: '0.75rem' }}>Highest Spent Category</span>
            <span className="metric-value" style={{ fontSize: '1.4rem', color: 'var(--accent-pink)' }}>
              {summary?.highestCategoryName && summary.highestCategoryName !== 'None' ? summary.highestCategoryName : 'None'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        {/* Category-wise Spending Bar Chart */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Grid size={18} /> Category Wise Expenditures</h3>
          </div>
          <div style={{ position: 'relative', height: '300px' }}>
            {summary?.categoryBreakdowns?.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category data available for {selectedMonth}
              </div>
            )}
          </div>
        </div>

        {/* Historical Monthly Trend Line Chart */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} /> Spending Trend Over Months</h3>
          </div>
          <div style={{ position: 'relative', height: '300px' }}>
            {summary?.monthlyTrends?.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No historical trend data available
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown details list */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Detailed Breakdown Table ({selectedMonth})</h3>
          </div>
          <div className="table-wrapper">
            {summary?.categoryBreakdowns?.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Total Expenses Amount</th>
                    <th>Share Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.categoryBreakdowns.map((c, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                      <td style={{ fontWeight: 700 }}>${c.amount.toFixed(2)}</td>
                      <td style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>{c.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '30px 0', textAlignment: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                No data available for this month
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
