import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Wallet, Calendar, AlertTriangle, ArrowRight, Settings } from 'lucide-react';

export default function BudgetTracker({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeBudget, setActiveBudget] = useState(null);

  // Form State
  const [limitInput, setLimitInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      // Fetch currently selected month's budget details
      const active = await api.budgets.get(selectedMonth);
      setActiveBudget(active);
      setLimitInput(active?.monthlyLimit > 0 ? active.monthlyLimit.toString() : '');

      // Fetch all historical budgets set
      const history = await api.budgets.list();
      setBudgets(history || []);
    } catch (err) {
      showToast(err.message || 'Error loading budget', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, [selectedMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limitInput || parseFloat(limitInput) <= 0) {
      showToast('Please enter a valid positive budget limit', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const saved = await api.budgets.createOrUpdate({
        monthlyLimit: parseFloat(limitInput),
        month: selectedMonth
      });
      showToast('Monthly budget updated successfully', 'success');
      loadBudgetData();
    } catch (err) {
      showToast(err.message || 'Failed to save budget limit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressBarColor = (pct) => {
    if (pct >= 100) return 'var(--danger)';
    if (pct >= 80) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Monthly Budget Tracker</h1>
          <p>Configure spending thresholds and monitor progress bars</p>
        </div>
      </div>

      <div className="content-grid">
        {/* Left Side: Active Budget Monitor */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} /> Budget Status for {selectedMonth}
            </h3>
            <input
              type="month"
              className="filter-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlignment: 'center', fontWeight: 600, textAlign: 'center' }}>Loading budget status...</div>
          ) : activeBudget && activeBudget.monthlyLimit > 0 ? (
            <div>
              {/* Progress Tracker Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total Spent: <strong style={{ color: 'var(--text-primary)' }}>${activeBudget.currentExpenses.toFixed(2)}</strong>
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Limit: <strong style={{ color: 'var(--text-primary)' }}>${activeBudget.monthlyLimit.toFixed(2)}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 16, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ 
                  width: `${Math.min(activeBudget.usagePercentage, 100)}%`, 
                  height: '100%', 
                  background: getProgressBarColor(activeBudget.usagePercentage), 
                  borderRadius: 8,
                  transition: 'width 0.5s ease',
                  boxShadow: `0 0 10px ${getProgressBarColor(activeBudget.usagePercentage)}`
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {activeBudget.usagePercentage.toFixed(1)}% Used
                </div>
                <div style={{ 
                  fontWeight: 700, 
                  color: activeBudget.remainingBalance >= 0 ? 'var(--success)' : 'var(--danger)' 
                }}>
                  {activeBudget.remainingBalance >= 0 
                    ? `$${activeBudget.remainingBalance.toFixed(2)} Remaining` 
                    : `$${Math.abs(activeBudget.remainingBalance).toFixed(2)} Over Budget`}
                </div>
              </div>

              {activeBudget.usagePercentage >= 80 && (
                <div className={`alert-message-banner ${activeBudget.usagePercentage >= 100 ? 'critical' : ''}`} style={{ marginTop: 24, marginBottom: 0 }}>
                  <AlertTriangle size={18} />
                  <span>
                    {activeBudget.usagePercentage >= 100 
                      ? 'CRITICAL ALERT: You have completely exhausted and exceeded this month\'s budget!' 
                      : 'WARNING: You have used more than 80% of your allocated monthly allowance.'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-glass)', borderRadius: 16, color: 'var(--text-secondary)' }}>
              No budget limit has been configured for {selectedMonth} yet. Use the form on the right to set one!
            </div>
          )}
        </div>

        {/* Right Side: Setup form & lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {/* Form Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings size={18} /> Set/Adjust Budget
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Month</label>
                <input
                  type="month"
                  className="form-control"
                  style={{ paddingLeft: 14 }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Monthly Limit ($)</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ paddingLeft: 14 }}
                  placeholder="e.g. 2000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Budget Limit'}
              </button>
            </form>
          </div>

          {/* Historical Budgets List */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Historical Budgets</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxValues: 240, overflowY: 'auto' }}>
              {budgets.length > 0 ? (
                budgets.map(b => (
                  <div 
                    key={b.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--border-glass)', 
                      borderRadius: 12,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedMonth(b.month)}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.month}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Limit: ${b.monthlyLimit.toFixed(0)}</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-pink)' }}>
                      View Details <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No budget history available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
