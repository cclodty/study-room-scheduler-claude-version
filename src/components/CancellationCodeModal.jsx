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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 text-center border-b border-slate-100">
          <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800">預約成功</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {name}｜{date}｜{slot}｜{room}
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Code */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-amber-600 mb-2 tracking-wider">取消預約碼</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-black tracking-[0.25em] text-amber-700 font-mono leading-none">
                {code}
              </span>
              <button onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                  ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-200 hover:bg-amber-300 text-amber-800'}`}>
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>

          {/* Warning */}
          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">
            ⚠️ 此碼<strong className="text-slate-700">只顯示一次</strong>，遺失後請聯絡管理員。如需取消，點擊該時段格子輸入此碼即可。
          </p>

          {/* Acknowledge */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 accent-blue-600 flex-shrink-0" />
            <span className="text-sm text-slate-700">我已記下取消碼</span>
          </label>

          <button onClick={onClose} disabled={!acknowledged}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors
              ${acknowledged ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
