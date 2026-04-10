import { useState } from 'react';
import { TIME_SLOTS, STUDENT_DEFAULT_SLOTS } from '../utils/constants';
import { addBooking } from '../utils/storage';


function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function BookingModal({ target, onSuccess, onClose }) {
  const { date, slotId, room } = target;
  const slot = TIME_SLOTS.find((s) => s.id === slotId);
  const roomLabel = room === 'large' ? '大研討室' : '小研討室';
  const defaultType = STUDENT_DEFAULT_SLOTS.includes(slotId) ? 'student' : 'teacher';

  const [type, setType] = useState(defaultType);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [purpose, setPurpose] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('請輸入姓名'); return; }
    if (type === 'teacher' && !department.trim()) { setError('請輸入科組'); return; }
    if (type === 'student') {
      if (!studentClass.trim()) { setError('請輸入班級'); return; }
      if (!purpose.trim()) { setError('請輸入用途'); return; }
      if (!headcount || Number(headcount) < 1) { setError('請輸入人數'); return; }
    }

    const code = generateCode();
    const booking = {
      id: `${date}_${slotId}_${room}_${Date.now()}`,
      date,
      slotId,
      room,
      type,
      name: name.trim(),
      department: type === 'teacher' ? department.trim() : '',
      class: type === 'student' ? studentClass.trim() : '',
      purpose: type === 'student' ? purpose.trim() : '',
      headcount: type === 'student' ? Number(headcount) : 0,
      cancelCode: code,
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await addBooking(booking);
      onSuccess(code, booking);
    } catch (err) {
      console.error('addBooking error:', err);
      // Show full Supabase error details (code, message, details, hint)
      const parts = [err?.message || JSON.stringify(err)];
      if (err?.code) parts.push(`[code: ${err.code}]`);
      if (err?.details) parts.push(err.details);
      if (err?.hint) parts.push(err.hint);
      setError(`提交失敗：${parts.join(' — ')}`);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">預約研討室</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {date} · {slot?.label} {slot?.time} · {roomLabel}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">預約身份</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => setType('teacher')}
                className={`flex-1 py-2 text-sm transition-colors ${type === 'teacher' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                老師
              </button>
              <button
                type="button"
                onClick={() => setType('student')}
                className={`flex-1 py-2 text-sm transition-colors ${type === 'student' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                學生
              </button>
            </div>
          </div>

          {/* Common: name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="請輸入姓名"
            />
          </div>

          {/* Teacher: department */}
          {type === 'teacher' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                科組 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="例：數學科"
              />
            </div>
          )}

          {/* Student fields */}
          {type === 'student' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  班級 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="例：3A"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  用途 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="例：小組討論"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  人數 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="人數"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
            >
              {submitting ? '提交中…' : '確認預約'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
