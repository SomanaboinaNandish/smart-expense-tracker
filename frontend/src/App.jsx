import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExpenseManager from './pages/ExpenseManager';
import BudgetTracker from './pages/BudgetTracker';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import { Menu } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { user, loading } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', fontWeight: 600 }}>
        Initializing SmartExpense...
      </div>
    );
  }

  // Guard routes: if not authenticated, redirect to registration or login
  if (!user) {
    if (currentPage === 'register') {
      return (
        <>
          <Register setCurrentPage={setCurrentPage} showToast={showToast} />
          {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        </>
      );
    }
    return (
      <>
        <Login setCurrentPage={setCurrentPage} showToast={showToast} />
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
      </>
    );
  }

  // Guard admin route: only admins allowed
  if (currentPage === 'admin' && user.role !== 'ADMIN') {
    setCurrentPage('dashboard');
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} showToast={showToast} />;
      case 'expenses':
        return <ExpenseManager showToast={showToast} />;
      case 'budget':
        return <BudgetTracker showToast={showToast} />;
      case 'analytics':
        return <Analytics showToast={showToast} />;
      case 'admin':
        return <AdminPanel showToast={showToast} />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} showToast={showToast} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile responsive hamburger header */}
      <div className="mobile-nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>💰</div>
          <h3 style={{ fontWeight: 800 }}>SmartExpense</h3>
        </div>
        <button 
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      {/* Floating Notifications */}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
