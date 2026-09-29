import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3000/api";

const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

function getServices(booking) {
  if (booking.services?.length) return booking.services;
  return booking.service ? [booking.service] : [];
}

function getBookingTotal(booking) {
  const mainTotal = getServices(booking).reduce(
    (sum, service) => sum + Number(service?.price || 0),
    0
  );
  const subTotal = (booking.selectedSubServices || []).reduce(
    (sum, service) => sum + Number(service?.price || 0),
    0
  );
  return mainTotal + subTotal;
}

export default function MyBookings() {
  const [list, setList] = useState([]);
  const [message, setMessage] = useState("");

  async function loadBookings() {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể tải lịch đặt");
      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancel(id) {
    if (!window.confirm("Bạn có chắc muốn hủy lịch này?")) return;

    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể hủy lịch");
      loadBookings();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const stats = useMemo(() => {
    const validBookings = list.filter((item) => item.status !== "cancelled");
    const completedBookings = list.filter((item) => item.status === "completed");
    const totalBooked = validBookings.reduce((sum, item) => sum + getBookingTotal(item), 0);
    const totalSpent = completedBookings.reduce((sum, item) => sum + getBookingTotal(item), 0);
    const totalServices = validBookings.reduce(
      (sum, item) => sum + getServices(item).length + (item.selectedSubServices?.length || 0),
      0
    );

    return {
      bookings: validBookings.length,
      completed: completedBookings.length,
      totalBooked,
      totalSpent,
      totalServices,
    };
  }, [list]);

  return (
    <main className="container page my-bookings-page">
      <header className="my-bookings-hero">
        <div>
          <span className="section-kicker">TÀI KHOẢN CỦA TÔI</span>
          <h1>Lịch đặt của tôi</h1>
          <p>Quản lý lịch hẹn, trạng thái và chi tiêu dịch vụ của bạn.</p>
        </div>
        <div className="hero-badge">📅 {stats.bookings} lịch đang theo dõi</div>
      </header>

      {message && <div className="error">{message}</div>}

      <section className="booking-summary">
        <div className="summary-card">
          <div className="summary-icon blue">📅</div>
          <div><span>Lịch đã đặt</span><strong>{stats.bookings}</strong><small>Không tính lịch đã hủy</small></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green">✓</div>
          <div><span>Đã hoàn thành</span><strong>{stats.completed}</strong><small>Lịch đã sử dụng</small></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon purple">✦</div>
          <div><span>Dịch vụ đã chọn</span><strong>{stats.totalServices}</strong><small>Gồm dịch vụ phụ</small></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">₫</div>
          <div><span>Giá trị đặt lịch</span><strong>{money(stats.totalBooked)}</strong><small>Tổng các lịch chưa hủy</small></div>
        </div>
      </section>

      <div className="my-bookings-layout">
        <section className="my-bookings-list panel-card">
          <div className="panel-title-row">
            <div>
              <h2>📋 Danh sách lịch hẹn</h2>
              <p>Xem chi tiết và hủy lịch khi cần.</p>
            </div>
            <div className="booking-count">{list.length} lịch</div>
          </div>

          {!list.length ? (
            <div className="empty my-bookings-empty">
              <div className="empty-icon">📅</div>
              <h3>Chưa có lịch đặt</h3>
              <p>Bạn chưa đặt dịch vụ nào. Hãy chọn dịch vụ và đặt lịch ngay.</p>
            </div>
          ) : (
            <div className="booking-cards">
              {list.map((booking) => {
                const services = getServices(booking);
                const canCancel = !["completed", "cancelled"].includes(booking.status);
                return (
                  <article className={`booking-card booking-${booking.status}`} key={booking._id}>
                    <div className="booking-card-main">
                      <div className="booking-service">
                        <div className="service-avatar">✦</div>
                        <div>
                          <h3>{services.map((service) => service.name).join(" + ") || "Không có dịch vụ"}</h3>
                          {booking.selectedSubServices?.length > 0 && (
                            <p className="sub-service-note">
                              + {booking.selectedSubServices.map((item) => item.name).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`status status-large ${booking.status}`}>
                        {labels[booking.status] || booking.status}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div><span>📅 Ngày</span><strong>{booking.date || "—"}</strong></div>
                      <div><span>🕐 Giờ</span><strong>{booking.time || "—"}</strong></div>
                      <div><span>👤 Nhân viên</span><strong>{booking.employee?.name || "Chưa phân công"}</strong></div>
                      <div>
                        <span>💳 Thanh toán</span>
                        <strong>{booking.paymentMethod === "qr" ? "Quét QR" : "Tiền mặt"}</strong>
                        <small className={booking.paymentStatus === "paid" ? "paid" : ""}>
                          {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </small>
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      <div>
                        <span>Tổng tiền</span>
                        <strong>{money(getBookingTotal(booking))}</strong>
                      </div>
                      {canCancel && (
                        <button className="danger booking-cancel" onClick={() => cancel(booking._id)}>
                          Hủy lịch
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="my-bookings-stats panel-card">
          <div className="panel-title-row">
            <div>
              <h2>💰 Chi tiêu</h2>
              <p>Tổng hợp dịch vụ của bạn</p>
            </div>
            <div className="stats-icon">₫</div>
          </div>

          <div className="spending-highlight">
            <span>Đã sử dụng dịch vụ</span>
            <strong>{money(stats.totalSpent)}</strong>
            <small>Chỉ tính các lịch đã hoàn thành</small>
          </div>

          <div className="stats-grid">
            <div className="stat-item"><span>Lịch đã đặt</span><strong>{stats.bookings}</strong></div>
            <div className="stat-item"><span>Đã hoàn thành</span><strong>{stats.completed}</strong></div>
            <div className="stat-item"><span>Dịch vụ</span><strong>{stats.totalServices}</strong></div>
            <div className="stat-item"><span>Giá trị đặt</span><strong>{money(stats.totalBooked)}</strong></div>
          </div>

          <div className="spending-note">
            <b>💡 Lưu ý</b>
            <p>Lịch đã hủy không được tính vào tổng chi tiêu. “Đã sử dụng” chỉ tính lịch có trạng thái <strong>Hoàn thành</strong>.</p>
          </div>
        </aside>
      </div>
    </main>
  );

}
