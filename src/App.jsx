import { useState } from 'react';
import Calendar from './components/Calendar';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [view, setView] = useState('calendar');
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            {/* Grid icon (library feel) */}
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 leading-tight">圖書館研討室預約系統</h1>
              {view === 'admin' && (
                <span className="text-xs text-blue-600 font-medium">管理員後台</span>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {view === 'calendar' ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                管理員
              </button>
            ) : (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                登出
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-3 py-4">
        {view === 'calendar' ? <Calendar /> : <AdminPanel />}
      </main>

      {showAdminLogin && (
        <AdminLogin onSuccess={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />
      )}
    </div>
  );
}
