import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Download, Filter, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';

export default function ExpenseManager({ showToast }) {
  // State
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Filtering & Sorting State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    minAmount: '',
    maxAmount: '',
    query: ''
  });
  const [sortBy, setSortBy] = useState('expenseDate');
  const [sortDir, setSortDir] = useState('desc');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CARD',
    categoryId: ''
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.expenses.list({
        ...filters,
        page,
        size: pageSize,
        sortBy,
        sortDir
      });
      setExpenses(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showToast(err.message || 'Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const list = await api.categories.list();
      setCategories(list || []);
      if (list && list.length > 0) {
        setForm(prev => ({ ...prev, categoryId: list[0].id }));
      }
    } catch (err) {
      showToast('Error loading categories', 'error');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [page, filters, sortBy, sortDir]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setForm({
      title: '',
      description: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CARD',
      categoryId: categories.length > 0 ? categories[0].id : ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      description: expense.description || '',
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod,
      categoryId: expense.categoryId
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.expenses.delete(id);
      showToast('Expense deleted successfully', 'success');
      loadExpenses();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.expenseDate || !form.categoryId) {
      showToast('Please check all fields', 'error');
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      showToast('Amount must be positive value', 'error');
      return;
    }

    try {
      let result;
      if (editingExpense) {
        result = await api.expenses.update(editingExpense.id, form);
        showToast('Expense updated successfully', 'success');
      } else {
        result = await api.expenses.create(form);
        showToast('Expense created successfully', 'success');
      }
      
      // If backend returned a budget limit warnings string, trigger an alert toast!
      if (result && result.budgetAlert) {
        showToast(result.budgetAlert, 'warning');
      }
      
      setModalOpen(false);
      loadExpenses();
    } catch (err) {
      showToast(err.message || 'Failed to save expense', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const query = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          query.append(key, filters[key]);
        }
      });
      const response = await fetch(`http://localhost:8080/api/expenses/export?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Expenses Management</h1>
          <p>Add, filter, paginate and export your records</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'auto' }} onClick={handleOpenAdd}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filter-item">
          <label>Search Keyword</label>
          <input
            type="text"
            name="query"
            className="filter-control"
            placeholder="Search details..."
            value={filters.query}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-item">
          <label>Category</label>
          <select
            name="categoryId"
            className="filter-control"
            value={filters.categoryId}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            className="filter-control"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-item">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            className="filter-control"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-item" style={{ minWidth: '100px' }}>
          <label>Min ($)</label>
          <input
            type="number"
            name="minAmount"
            className="filter-control"
            placeholder="Min"
            value={filters.minAmount}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-item" style={{ minWidth: '100px' }}>
          <label>Max ($)</label>
          <input
            type="number"
            name="maxAmount"
            className="filter-control"
            placeholder="Max"
            value={filters.maxAmount}
            onChange={handleFilterChange}
          />
        </div>
        <button 
          className="btn-secondary" 
          style={{ padding: '10px 14px' }} 
          onClick={() => {
            setFilters({ startDate: '', endDate: '', categoryId: '', minAmount: '', maxAmount: '', query: '' });
            setPage(0);
          }}
        >
          Reset
        </button>
      </div>

      {/* Main Content Card */}
      <div className="dashboard-card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontWeight: 600 }}>Loading transaction list...</div>
          ) : expenses.length > 0 ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('title'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                    Title {sortBy === 'title' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Category</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('expenseDate'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                    Date {sortBy === 'expenseDate' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Payment Method</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('amount'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                    Amount {sortBy === 'amount' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
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
                    <td style={{ fontWeight: 700, color: '#f43f5e' }}>-${parseFloat(e.amount).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-secondary" style={{ padding: 6, display: 'inline-flex', borderRadius: 6 }} onClick={() => handleOpenEdit(e)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-secondary" style={{ padding: 6, display: 'inline-flex', borderRadius: 6, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(e.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlignment: 'center', padding: '40px 0', color: '#645f7c', textAlign: 'center' }}>No expenses found matching the selected filters.</div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <span style={{ fontSize: '0.9rem', color: '#9b95b6' }}>
              Showing Page {page + 1} of {totalPages} ({totalElements} total records)
            </span>
            <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Glassmorphic Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingExpense ? 'Edit Expense Record' : 'Add New Expense'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: 14 }}
                  placeholder="e.g., Starbucks Coffee"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: 14 }}
                  placeholder="Additional remarks..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    style={{ paddingLeft: 14 }}
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expense Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ paddingLeft: 14 }}
                    value={form.expenseDate}
                    onChange={(e) => setForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    style={{ paddingLeft: 14 }}
                    value={form.categoryId}
                    onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    className="form-control"
                    style={{ paddingLeft: 14 }}
                    value={form.paymentMethod}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    required
                  >
                    <option value="CARD">CARD</option>
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
