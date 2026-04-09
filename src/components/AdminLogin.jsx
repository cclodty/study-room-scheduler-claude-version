import { useState } from 'react';
import { verifyAdminPassword } from '../utils/storage';

export default function AdminLogin({ onSuccess, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (verifyAdminPassword(password)) {
      onSuccess();
    } else {
      setError('密碼不正確');
      setPassword('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xs">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">管理員登入</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">管理員密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="請輸入密碼"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700"
            >
              登入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
