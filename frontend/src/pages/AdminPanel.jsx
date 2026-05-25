import React, { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Receipt, Landmark, ShieldAlert, Trash2 } from 'lucide-react';

export default function AdminPanel({ showToast }) {
  const { user: currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const systemStats = await api.admin.getStats();
      setStats(systemStats);

      const list = await api.admin.listUsers();
      setUsersList(list || []);
    } catch (err) {
      showToast(err.message || 'Failed to load administrator data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [currentUser]);

  const handleDeleteUser = async (id, name) => {
    if (currentUser?.email && usersList.find(u => u.id === id)?.email === currentUser.email) {
      showToast('You cannot delete your own active admin account!', 'error');
      return;
    }

    if (!window.confirm(`WARNING: Deleting user "${name}" will remove all their expenses, budgets, and transactions permanently. Proceed?`)) {
      return;
    }

    try {
      await api.admin.deleteUser(id);
      showToast(`User ${name} deleted successfully`, 'success');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: 16 }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>This panel is reserved for system administrators only.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Platform Administration</h1>
          <p>Monitor platform growth, database counts, and manage user directories</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontWeight: 600 }}>Loading system panel...</div>
      ) : (
        <div>
          {/* Admin Stats Metrics Panel */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Users size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Total Users</span>
                <span className="metric-value">{stats?.totalUsersCount || 0}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                <Receipt size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Transactions</span>
                <span className="metric-value">{stats?.totalExpensesCount || 0}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Landmark size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Platform Volume</span>
                <span className="metric-value">${stats?.totalPlatformSpending?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <ShieldAlert size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Active Budgets</span>
                <span className="metric-value">{stats?.activeBudgetsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Users List Card */}
          <div className="dashboard-card" style={{ marginTop: 30 }}>
            <div className="card-header">
              <h3>Registered Platform Users</h3>
            </div>

            <div className="table-wrapper">
              {usersList.length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>System Role</th>
                      <th>Registration Date</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge`} style={{ 
                            background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: u.role === 'ADMIN' ? '#ef4444' : '#60a5fa'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                        <td>
                          <button 
                            className="btn-secondary" 
                            style={{ 
                              padding: 6, 
                              display: 'inline-flex', 
                              borderRadius: 6,
                              color: '#ef4444', 
                              borderColor: 'rgba(239, 68, 68, 0.2)' 
                            }} 
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={u.email === currentUser.email}
                            title={u.email === currentUser.email ? "Cannot delete yourself" : "Delete user database records"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlignment: 'center', padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No registered users found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
