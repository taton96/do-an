import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusIcons = { pending: "◷", confirmed: "✓", completed: "✓", cancelled: "×" };

function localToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function servicesOf(booking) {
  const list = booking?.services?.length ? booking.services : booking?.service ? [booking.service] : [];
  return list.filter(Boolean);
}

function totalDuration(booking) {
  return servicesOf(booking).reduce((sum, item) => sum + Number(item.duration || 0), 0);
}

function priceOf(booking) {
  const services = servicesOf(booking);
  const base = services.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const extras = (booking?.selectedSubServices || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
  return base + extras;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setMessage("");
      const response = await api.get("/appointments");
      setList(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date());
    } catch (error) {
      setMessage(error.response?.data?.message || "Không tải được lịch làm việc. Vui lòng thử lại.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 15000);
    return () => clearInterval(timer);
  }, [load]);

  const today = localToday();

  const stats = useMemo(() => ({
    today: list.filter(x => x.date === today && x.status !== "cancelled").length,
    pending: list.filter(x => x.status === "pending").length,
    confirmed: list.filter(x => x.status === "confirmed").length,
    completed: list.filter(x => x.status === "completed").length,
  }), [list, today]);

  const visibleList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter(item => filter === "all" || item.status === filter)
      .filter(item => {
        if (!q) return true;
        const services = servicesOf(item).map(x => x.name).join(" ");
        return [item.customerName, item.customerPhone, item.customer?.name, item.customer?.phone, services]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [list, filter, query]);

  const todayList = useMemo(() => list
    .filter(item => item.date === today && item.status !== "cancelled")
    .sort((a, b) => String(a.time).localeCompare(String(b.time))), [list, today]);

  const update = async (booking, status) => {
    try {
      setUpdating(`${booking._id}:${status}`);
      setMessage("");
      const response = await api.put(`/appointments/${booking._id}/status`, { status });
      const updated = response.data?.appointment;
      setList(current => current.map(item => item._id === booking._id ? (updated || { ...item, status }) : item));
      setSelected(updated || { ...booking, status });
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể cập nhật trạng thái lịch hẹn.");
    } finally {
      setUpdating("");
    }
  };

  const nextAction = booking => {
    if (booking.status === "pending") return { status: "confirmed", label: "Xác nhận lịch" };
    if (booking.status === "confirmed") return { status: "completed", label: "Đánh dấu hoàn thành" };
    return null;
  };

  return (
    <main className="container page staff-page">
      <section className="staff-hero">
        <div>
          <div className="eyebrow">KHU VỰC NHÂN VIÊN</div>
          <h1>Xin chào, {user?.name || "Nhân viên"} 👋</h1>
          <p>Theo dõi lịch được phân công, xử lý khách hàng và cập nhật trạng thái dịch vụ trong ngày.</p>
        </div>
        <div className="staff-hero-actions">
          <span className="live-indicator"><i /> Đồng bộ tự động</span>
          <button type="button" className="outline-btn" onClick={() => load()} disabled={loading}>↻ {loading ? "Đang tải" : "Làm mới"}</button>
        </div>
      </section>

      {message && <div className="error staff-alert">{message}<button type="button" onClick={() => setMessage("")}>×</button></div>}

      <section className="staff-stats">
        <div className="staff-stat primary"><span className="stat-icon">▣</span><div><strong>{stats.today}</strong><small>Lịch hôm nay</small></div></div>
        <div className="staff-stat warning"><span className="stat-icon">◷</span><div><strong>{stats.pending}</strong><small>Chờ xác nhận</small></div></div>
        <div className="staff-stat info"><span className="stat-icon">✓</span><div><strong>{stats.confirmed}</strong><small>Đã xác nhận</small></div></div>
        <div className="staff-stat success"><span className="stat-icon">★</span><div><strong>{stats.completed}</strong><small>Đã hoàn thành</small></div></div>
      </section>

      <section className="staff-grid">
        <div className="staff-main-card">
          <div className="staff-section-head">
            <div><h2>Lịch được phân công</h2><p>{lastUpdated ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "Đang tải dữ liệu..."}</p></div>
            <span className="result-count">{visibleList.length} lịch</span>
          </div>

          <div className="staff-toolbar">
            <label className="staff-search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên, số điện thoại, dịch vụ..." /></label>
            <div className="staff-filters">
              {["all", "pending", "confirmed", "completed", "cancelled"].map(status => (
                <button key={status} type="button" className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>
                  {status === "all" ? "Tất cả" : labels[status]}
                </button>
              ))}
            </div>
          </div>

          {loading ? <div className="staff-loading"><span /> Đang tải lịch làm việc...</div> : !visibleList.length ? (
            <div className="staff-empty"><div>◌</div><h3>Không có lịch phù hợp</h3><p>Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p></div>
          ) : (
            <div className="staff-appointments">
              {visibleList.map(booking => {
                const action = nextAction(booking);
                const isUpdating = updating.startsWith(`${booking._id}:`);
                return (
                  <article className={`staff-appointment ${booking.status}`} key={booking._id}>
                    <div className="appointment-time"><strong>{booking.time || "--:--"}</strong><span>{normalizeDate(booking.date)}</span></div>
                    <div className="appointment-person"><div className="customer-avatar">{(booking.customer?.name || booking.customerName || "K").charAt(0).toUpperCase()}</div><div><strong>{booking.customer?.name || booking.customerName || "Khách hàng"}</strong><span>{booking.customerPhone || booking.customer?.phone || "Chưa có SĐT"}</span></div></div>
                    <div className="appointment-service"><strong>{servicesOf(booking).map(x => x.name).join(" + ") || "Dịch vụ"}</strong><span>{totalDuration(booking) ? `${totalDuration(booking)} phút` : "Thời lượng chưa xác định"}</span></div>
                    <div className="appointment-status"><span className={`status ${booking.status}`}><b>{statusIcons[booking.status]}</b> {labels[booking.status]}</span></div>
                    <div className="appointment-actions"><button type="button" className="link-action" onClick={() => setSelected(booking)}>Chi tiết</button>{action && <button type="button" className="primary-action" disabled={isUpdating} onClick={() => update(booking, action.status)}>{isUpdating ? "Đang xử lý..." : action.label}</button>}</div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="staff-side-card">
          <div className="staff-section-head"><div><h2>Hôm nay</h2><p>Lịch trong ngày</p></div><span className="today-badge">{todayList.length}</span></div>
          {todayList.length ? <div className="today-list">{todayList.slice(0, 6).map(item => <button type="button" key={item._id} onClick={() => setSelected(item)}><span className="today-time">{item.time}</span><span className="today-info"><strong>{item.customer?.name || item.customerName || "Khách hàng"}</strong><small>{servicesOf(item).map(x => x.name).join(" + ") || "Dịch vụ"}</small></span><span className={`mini-dot ${item.status}`} /></button>)}</div> : <div className="today-empty">Hôm nay chưa có lịch được phân công.</div>}
          {todayList.length > 6 && <button type="button" className="view-all-btn" onClick={() => { setFilter("all"); setQuery(""); }}>Xem toàn bộ lịch →</button>}
        </aside>
      </section>

      {selected && <div className="staff-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}><section className="staff-modal" role="dialog" aria-modal="true" aria-label="Chi tiết lịch hẹn">
        <div className="staff-modal-head"><div><span className="eyebrow">CHI TIẾT LỊCH HẸN</span><h2>{selected.customer?.name || selected.customerName || "Khách hàng"}</h2></div><button type="button" className="modal-close" onClick={() => setSelected(null)}>×</button></div>
        <div className="detail-status"><span className={`status ${selected.status}`}><b>{statusIcons[selected.status]}</b> {labels[selected.status]}</span><span>{normalizeDate(selected.date)} · {selected.time}</span></div>
        <div className="detail-grid"><div><small>Khách hàng</small><strong>{selected.customer?.name || selected.customerName || "-"}</strong></div><div><small>Số điện thoại</small><strong>{selected.customerPhone || selected.customer?.phone || "-"}</strong></div><div><small>Dịch vụ</small><strong>{servicesOf(selected).map(x => x.name).join(" + ") || "-"}</strong></div><div><small>Thời lượng</small><strong>{totalDuration(selected) ? `${totalDuration(selected)} phút` : "-"}</strong></div><div><small>Thanh toán</small><strong>{selected.paymentMethod === "qr" ? "QR Code" : "Tiền mặt"}</strong></div><div><small>Tổng dự kiến</small><strong>{priceOf(selected).toLocaleString("vi-VN")} ₫</strong></div></div>
        {selected.note && <div className="detail-note"><small>Ghi chú của khách</small><p>{selected.note}</p></div>}
        {selected.selectedSubServices?.length > 0 && <div className="detail-note"><small>Dịch vụ bổ sung</small><p>{selected.selectedSubServices.map(x => x.name).join(", ")}</p></div>}
        <div className="staff-modal-actions"><button type="button" className="outline-btn" onClick={() => setSelected(null)}>Đóng</button>{nextAction(selected) && <button type="button" className="btn" disabled={updating.startsWith(`${selected._id}:`)} onClick={() => update(selected, nextAction(selected).status)}>{updating ? "Đang xử lý..." : nextAction(selected).label}</button>}</div>
      </section></div>}
    </main>
  );
}
