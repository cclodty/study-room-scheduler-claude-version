import { useState } from 'react';

export default function CancellationCodeModal({ data, onClose }) {
  const { code, name, slot, room, date } = data;
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* ── Success banner ─────────────────────────────────────── */}
        <div className="bg-emerald-500 rounded-t-2xl px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">預約成功</h2>
          <p className="text-emerald-100 text-sm mt-1">{name}</p>
        </div>

        {/* ── Booking details ─────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-2">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">日期</p>
              <p className="text-sm font-semibold text-slate-800">{date}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">研討室</p>
              <p className="text-sm font-semibold text-slate-800">{room}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-slate-400 mb-1">時段</p>
              <p className="text-sm font-semibold text-slate-800">{slot}</p>
            </div>
          </div>
        </div>

        {/* ── Cancellation code ───────────────────────────────────── */}
        <div className="px-6 py-4">
          <div className="border-2 border-amber-300 bg-amber-50 rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">
              取消預約碼
            </p>
            {/* Big code */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {code.split('').map((digit, i) => (
                <span key={i}
                  className="w-14 h-16 flex items-center justify-center bg-white border-2 border-amber-200 rounded-xl text-4xl font-bold text-amber-700 font-mono shadow-sm">
                  {digit}
                </span>
              ))}
            </div>
            {/* Copy button */}
            <button onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all
                ${copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-800'}`}>
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  已複製！
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  複製取消碼
                </>
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <span>此取消碼<strong className="text-slate-700">只顯示一次</strong>，遺失後請聯絡管理員。如需取消，點擊該時段格子輸入此碼即可。</span>
          </div>
        </div>

        {/* ── Acknowledge & close ─────────────────────────────────── */}
        <div className="px-6 pb-6 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer bg-slate-50 rounded-xl px-4 py-3">
            <input type="checkbox" checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-5 h-5 accent-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700">我已記下或複製取消碼</span>
          </label>

          <button onClick={onClose} disabled={!acknowledged}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all
              ${acknowledged
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            完成
          </button>
        </div>

      </div>
    </div>
  );
}
