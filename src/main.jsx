import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabaseConfigured } from './utils/supabase.js'

// Global error boundary so a crash shows a message instead of blank page
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: 'system-ui, sans-serif', maxWidth: 480,
          margin: '80px auto', padding: '32px', background: '#fff',
          borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,.08)'
        }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ 應用程式啟動失敗</h2>
          <p style={{ color: '#475569' }}>{this.state.error.message}</p>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>
            請確認 GitHub Secrets 已正確設定：<br />
            <code style={{ background:'#f1f5f9', padding:'2px 6px', borderRadius:4 }}>VITE_SUPABASE_URL</code>
            {' '}及{' '}
            <code style={{ background:'#f1f5f9', padding:'2px 6px', borderRadius:4 }}>VITE_SUPABASE_ANON_KEY</code>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Show config warning banner if env vars missing (dev / misconfigured deploy)
function ConfigWarning() {
  if (supabaseConfigured) return null;
  return (
    <div style={{
      background: '#fef3c7', borderBottom: '1px solid #fcd34d',
      padding: '10px 16px', textAlign: 'center',
      fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#92400e'
    }}>
      ⚠️ Supabase 未設定（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 缺失），資料無法讀寫。
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ConfigWarning />
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
