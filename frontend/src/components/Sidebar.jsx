import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ReceiptText, Wallet, BarChart3, LogOut, ShieldCheck } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'USER' },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText, role: 'USER' },
    { id: 'budget', label: 'Budgets', icon: Wallet, role: 'USER' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, role: 'USER' },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, role: 'ADMIN' },
  ];

  const handleNav = (id) => {
    setCurrentPage(id);
    setSidebarOpen(false);
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="user-avatar" style={{ width: 40, height: 40 }}>💰</div>
        <h3>SmartExpense</h3>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          if (item.role === 'ADMIN' && user?.role !== 'ADMIN') return null;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <a
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <LogOut className="logout-icon" size={18} onClick={logout} title="Sign Out" />
        </div>
      )}
    </div>
  );
}
