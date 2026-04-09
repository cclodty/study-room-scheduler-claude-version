import { useState } from 'react';
import { TIME_SLOTS } from '../utils/constants';
import { removeBooking } from '../utils/storage';

export default function CancelBookingModal({ target, onSuccess, onClose }) {
  const { date, slotId, room, booking } = target;
  const slot = TIME_SLOTS.find((s) => s.id === slotId);
  const roomLabel = room === 'large' ? '大研討室' : '小研討室';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Recurring instances cannot be cancelled by users
  const isRecurring = booking?.isRecurringInstance || booking?.isRecurring;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!code.trim()) { setError('請輸入取消碼'); return; }
    if (code.trim() !== booking.cancelCode) {
      setError('取消碼不正確，請確認後再試');
      return;
    }
    removeBooking(booking.id);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">取消預約</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {date} · {slot?.label} {slot?.time} · {roomLabel}
          </p>
        </div>

        <div className="px-5 py-4">
          {/* Booking info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 space-y-1">
            <div><span className="text-gray-400">預約人：</span>{booking.name}</div>
            {booking.type === 'teacher'
              ? <div><span className="text-gray-400">科組：</span>{booking.department}</div>
              : <div><span className="text-gray-400">班級：</span>{booking.class}</div>
            }
          </div>

          {isRecurring ? (
            <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 mb-4">
              此為固定每週預約，如需取消請聯絡管理員。
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  請輸入 4 位取消碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="- - - -"
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  返回
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
                >
                  確認取消
                </button>
              </div>
            </form>
          )}

          {isRecurring && (
            <button
              onClick={onClose}
              className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              關閉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
