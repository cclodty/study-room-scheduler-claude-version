import { useState } from 'react';
import Calendar from './components/Calendar';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [view, setView] = useState('calendar'); // 'calendar' | 'admin'
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  function handleAdminLogin() {
    setView('admin');
    setShowAdminLogin(false);
  }

  function handleAdminLogout() {
    setView('calendar');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 leading-tight">
            圖書館研討室預約系統
          </h1>
          {view === 'calendar' ? (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              管理員登入
            </button>
          ) : (
            <button
              onClick={handleAdminLogout}
              className="text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              登出
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-2 py-4">
        {view === 'calendar' ? <Calendar /> : <AdminPanel />}
      </main>

      {/* Admin login modal */}
      {showAdminLogin && (
        <AdminLogin
          onSuccess={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}
