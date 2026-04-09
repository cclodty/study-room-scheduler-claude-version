import { useState } from 'react';

export default function CancellationCodeModal({ data, onClose }) {
  const { code, name, slot, room, date } = data;
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Success header */}
        <div className="px-5 pt-5 pb-4 text-center border-b border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800">預約成功！</h2>
          <p className="text-sm text-gray-500 mt-1">
            {name} · {date} · {slot} · {room}
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Code display */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-xs text-amber-600 font-medium mb-2">取消預約碼（請妥善保管）</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold tracking-[0.3em] text-amber-700 font-mono">
                {code}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
              >
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 leading-relaxed">
            ⚠️ 此取消碼只顯示一次，遺失後需聯絡圖書館管理員處理。若需取消預約，請點擊該時段格子並輸入取消碼。
          </div>

          {/* Acknowledge checkbox */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-600">我已記下取消碼</span>
          </label>

          <button
            onClick={onClose}
            disabled={!acknowledged}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
              ${acknowledged
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
