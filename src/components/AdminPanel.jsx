import { useState, useEffect, useCallback } from 'react';
import {
  getBookings, removeBooking, removeBookingsByDateRange,
  getRecurring, addRecurring, removeRecurring,
  getBlockedDates, addBlockedDate, removeBlockedDate,
  getAdminPassword, setAdminPassword,
} from '../utils/storage';
import { TIME_SLOTS } from '../utils/constants';
import { dayjs } from '../utils/dateUtils';
import { exportBookingsToExcel } from '../utils/excelExport';

const TABS = ['預約管理', '固定預約', '封鎖日期', '批量刪除', '匯出資料', '修改密碼'];

export default function AdminPanel() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ bookings: [], recurring: [], blockedDates: [] });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bookings, recurring, blockedDates] = await Promise.all([
        getBookings(), getRecurring(), getBlockedDates(),
      ]);
      setData({ bookings, recurring, blockedDates });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-800">管理員後台</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-xl shadow-sm p-1 border border-slate-200">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-medium
              ${tab === i ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            載入中…
          </div>
        ) : (
          <>
            {tab === 0 && <BookingManager bookings={data.bookings} onRefresh={loadAll} />}
            {tab === 1 && <RecurringManager rules={data.recurring} onRefresh={loadAll} />}
            {tab === 2 && <BlockedDateManager blocked={data.blockedDates} onRefresh={loadAll} />}
            {tab === 3 && <BatchDelete bookings={data.bookings} onRefresh={loadAll} />}
            {tab === 4 && <ExportData bookings={data.bookings} />}
            {tab === 5 && <ChangePassword />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Tab 0: Booking Manager ────────────────────────────────────────────────────

function BookingManager({ bookings, onRefresh }) {
  const sorted = [...bookings].sort((a, b) => a.date.localeCompare(b.date) || a.slotId.localeCompare(b.slotId));
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? sorted.filter((b) =>
        b.name.includes(filter) || b.date.includes(filter) ||
        (b.department || '').includes(filter) || (b.class || '').includes(filter))
    : sorted;

  async function handleDelete(id) {
    if (!confirm('確定取消此預約？')) return;
    await removeBooking(id);
    onRefresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="搜尋姓名、日期、班級…"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <span className="text-sm text-slate-500 whitespace-nowrap">{filtered.length} 筆</span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">暫無預約記錄</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {filtered.map((b) => {
            const slot = TIME_SLOTS.find((s) => s.id === b.slotId);
            return (
              <div key={b.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-800">{b.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                      ${b.room === 'large' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {b.room === 'large' ? '大研討室' : '小研討室'}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {b.type === 'teacher' ? '老師' : '學生'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{b.date} · {slot?.label} {slot?.time}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {b.type === 'teacher' ? b.department : `${b.class} · ${b.purpose} · ${b.headcount}人`}
                  </div>
                </div>
                <button onClick={() => handleDelete(b.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                  取消預約
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Recurring Manager ──────────────────────────────────────────────────

function RecurringManager({ rules, onRefresh }) {
  const DAY_LABELS = ['一', '二', '三', '四', '五'];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: '1', slotId: TIME_SLOTS[0].id, room: 'large', type: 'teacher',
    name: '', department: '', class: '', purpose: '', headcount: '',
    startDate: dayjs().format('YYYY-MM-DD'), endDate: '',
  });
  const [error, setError] = useState('');

  async function handleAdd() {
    setError('');
    if (!form.name.trim()) { setError('請輸入姓名'); return; }
    if (form.type === 'teacher' && !form.department.trim()) { setError('請輸入科組'); return; }
    if (form.type === 'student' && (!form.class.trim() || !form.purpose.trim() || !form.headcount)) {
      setError('請填寫班級、用途及人數'); return;
    }
    await addRecurring({
      id: `rec_${Date.now()}`, dayOfWeek: Number(form.dayOfWeek),
      slotId: form.slotId, room: form.room, type: form.type,
      name: form.name.trim(), department: form.department.trim(),
      class: form.class.trim(), purpose: form.purpose.trim(),
      headcount: form.headcount ? Number(form.headcount) : 0,
      startDate: form.startDate, endDate: form.endDate || null, isRecurring: true,
    });
    setShowForm(false);
    onRefresh();
  }

  async function handleDelete(id) {
    if (!confirm('確定移除此固定預約？')) return;
    await removeRecurring(id);
    onRefresh();
  }

  const sel = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm';
  const inp = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm';

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">每週固定預約會自動顯示在對應時段</p>
        <button onClick={() => setShowForm(!showForm)}
          className="text-sm px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          + 新增
        </button>
      </div>

      {showForm && (
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">星期</label>
              <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} className={sel}>
                {DAY_LABELS.map((d, i) => <option key={i + 1} value={i + 1}>週{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">時段</label>
              <select value={form.slotId} onChange={(e) => setForm({ ...form, slotId: e.target.value })} className={sel}>
                {TIME_SLOTS.map((s) => <option key={s.id} value={s.id}>{s.label} {s.time}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">研討室</label>
              <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className={sel}>
                <option value="large">大研討室</option>
                <option value="small">小研討室</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">身份</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={sel}>
                <option value="teacher">老師</option>
                <option value="student">學生</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">姓名 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
          </div>
          {form.type === 'teacher' ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">科組 *</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inp} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">班級 *</label>
                <input type="text" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">人數 *</label>
                <input type="number" min="1" value={form.headcount} onChange={(e) => setForm({ ...form, headcount: e.target.value })} className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">用途 *</label>
                <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={inp} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">開始日期</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">結束日期（空=長期）</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inp} />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-100">取消</button>
            <button onClick={handleAdd}
              className="flex-1 py-1.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">確認新增</button>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <p className="text-center text-slate-400 py-6 text-sm">暫無固定預約</p>
      ) : (
        <div className="space-y-2">
          {rules.map((r) => {
            const slot = TIME_SLOTS.find((s) => s.id === r.slotId);
            const dayLabel = ['', '一', '二', '三', '四', '五', '六', '日'][r.dayOfWeek];
            return (
              <div key={r.id} className="flex items-start gap-3 p-3 border border-blue-100 rounded-xl bg-blue-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-800">{r.name}</span>
                    <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">每週{dayLabel}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                      {r.room === 'large' ? '大研討室' : '小研討室'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{slot?.label} {slot?.time} · {r.type === 'teacher' ? r.department : r.class}</div>
                  <div className="text-xs text-slate-400">{r.startDate} ~ {r.endDate || '長期'}</div>
                </div>
                <button onClick={() => handleDelete(r.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50 flex-shrink-0">移除</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Blocked Date Manager ───────────────────────────────────────────────

function BlockedDateManager({ blocked, onRefresh }) {
  const sorted = [...blocked].sort((a, b) => a.date.localeCompare(b.date));
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  async function handleAdd() {
    if (!date) { setError('請選擇日期'); return; }
    await addBlockedDate({ date, reason: reason.trim() });
    setDate(''); setReason(''); setError('');
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
        <p className="text-sm font-medium text-slate-700">新增不開放日期</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">原因（選填）</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="例：公眾假期"
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
          </div>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button onClick={handleAdd}
          className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">新增</button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-center text-slate-400 py-6 text-sm">暫無封鎖日期</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((d) => (
            <div key={d.date} className="flex items-center gap-3 p-3 border border-red-100 rounded-xl bg-red-50">
              <div className="flex-1">
                <span className="font-semibold text-sm text-slate-800">{d.date}</span>
                {d.reason && <span className="text-slate-500 text-xs ml-2">{d.reason}</span>}
              </div>
              <button onClick={async () => { await removeBlockedDate(d.date); onRefresh(); }}
                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded-lg hover:bg-red-100">移除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Batch Delete ───────────────────────────────────────────────────────

function BatchDelete({ bookings, onRefresh }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  function handlePreview() {
    setError('');
    if (!startDate || !endDate) { setError('請選擇日期範圍'); return; }
    if (startDate > endDate) { setError('開始日期不能晚於結束日期'); return; }
    setPreview(bookings.filter((b) => b.date >= startDate && b.date <= endDate));
  }

  async function handleDelete() {
    if (!confirm(`確定刪除 ${preview.length} 筆預約？此操作無法復原。`)) return;
    await removeBookingsByDateRange(startDate, endDate);
    setPreview(null); setStartDate(''); setEndDate('');
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">批量刪除指定日期範圍內的所有預約</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">開始日期</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">結束日期</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button onClick={handlePreview}
        className="px-4 py-1.5 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700">預覽</button>

      {preview !== null && (
        <div className="border border-orange-200 rounded-xl p-4 bg-orange-50 space-y-3">
          <p className="text-sm font-medium text-orange-700">
            {startDate} 至 {endDate}，共 {preview.length} 筆預約
          </p>
          {preview.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {preview.map((b) => {
                const slot = TIME_SLOTS.find((s) => s.id === b.slotId);
                return (
                  <div key={b.id} className="text-xs text-orange-600">
                    {b.date} · {slot?.label} · {b.room === 'large' ? '大' : '小'}研討室 · {b.name}
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={handleDelete} disabled={preview.length === 0}
            className={`px-4 py-1.5 rounded-lg text-sm text-white transition-colors
              ${preview.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-300 cursor-not-allowed'}`}>
            確認刪除 {preview.length} 筆
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Export Data ────────────────────────────────────────────────────────

function ExportData({ bookings }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [msg, setMsg] = useState('');

  function handleExport() {
    const filtered = bookings.filter(
      (b) => (!startDate || b.date >= startDate) && (!endDate || b.date <= endDate)
    );
    if (filtered.length === 0) { setMsg('此範圍內沒有預約記錄'); return; }
    exportBookingsToExcel(startDate || null, endDate || null, filtered);
    setMsg(`已匯出 ${filtered.length} 筆記錄`);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">匯出預約記錄為 Excel 檔案（.xlsx）</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">開始日期（空=全部）</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">結束日期（空=全部）</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
        </div>
      </div>
      <button onClick={handleExport}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">匯出 Excel</button>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
    </div>
  );
}

// ── Tab 5: Change Password ────────────────────────────────────────────────────

function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSave() {
    setError(''); setSuccess('');
    if (!current || !next || !confirm) { setError('請填寫所有欄位'); return; }
    if (current !== getAdminPassword()) { setError('現有密碼不正確'); return; }
    if (next.length < 4) { setError('新密碼至少需要 4 位'); return; }
    if (next !== confirm) { setError('兩次輸入的新密碼不一致'); return; }
    setAdminPassword(next);
    setCurrent(''); setNext(''); setConfirm('');
    setSuccess('密碼已更新');
  }

  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm';
  return (
    <div className="space-y-3 max-w-xs">
      {[['現有密碼', current, setCurrent], ['新密碼', next, setNext], ['確認新密碼', confirm, setConfirm]].map(([label, val, setter]) => (
        <div key={label}>
          <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
          <input type="password" value={val} onChange={(e) => setter(e.target.value)} className={inp} />
        </div>
      ))}
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {success && <p className="text-emerald-600 text-xs">{success}</p>}
      <button onClick={handleSave}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">更新密碼</button>
    </div>
  );
}
