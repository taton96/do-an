import {Link} from "react-router-dom";import {getData,initialServices,initialStaff} from "../../data";
export default function Dashboard(){const b=getData("bookings",[]),s=getData("services",initialServices),st=getData("staff",initialStaff);return <main className="container page"><h1>Admin Dashboard</h1><div className="stats"><div><b>{b.length}</b><span>Tổng lịch</span></div><div><b>{b.filter(x=>x.status==="pending").length}</b><span>Chờ xác nhận</span></div><div><b>{b.filter(x=>x.status==="completed").length}</b><span>Hoàn thành</span></div><div><b>{s.length}</b><span>Dịch vụ</span></div><div><b>{st.length}</b><span>Nhân viên</span></div></div><div className="adminlinks"><Link to="/admin/services">Quản lý dịch vụ</Link><Link to="/admin/staff">Quản lý nhân viên</Link><Link to="/admin/bookings">Quản lý lịch hẹn</Link><Link to="/admin/schedules">Ca làm & ngày nghỉ</Link></div></main>}

export default function Dashboard() {
  // 1. Thu thập toàn bộ dữ liệu từ các mảng mẫu để làm thống kê
  const [bookings] = useState(getData("bookings") || []);
  const [services] = useState(getData("services") || []);
  const [staff] = useState(getData("staff") || []);

  // 2. Tính toán nhanh các số liệu hiển thị
  const totalBookings = bookings.length;
  const totalServices = services.length;
  const totalStaff = staff.length;

  // Đếm số đơn đang chờ duyệt (pending)
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <h2 style={{ color: "#333", marginBottom: "5px" }}>📊 HỆ THỐNG QUẢN TRỊ - DASHBOARD</h2>
      <p style={{ color: "#666", marginBottom: "25px", fontSize: "14px" }}>Chào mừng quay trở lại. Dưới đây là hiệu suất cửa hàng hôm nay.</p>

      {/* KHU VỰC 1: CÁC Ô SỐ LIỆU THỐNG KÊ (CARDS) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        {/* Ô 1: Tổng đơn đặt */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderLeft: "5px solid #007bff" }}>
          <span style={{ fontSize: "12px", color: "#888", fontWeight: "bold", textTransform: "uppercase" }}>Tổng lịch hẹn</span>
          <h3 style={{ margin: "10px 0 0 0", fontSize: "28px", color: "#333" }}>{totalBookings}</h3>
        </div>

        {/* Ô 2: Đơn chờ duyệt */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderLeft: "5px solid #ffc107" }}>
          <span style={{ fontSize: "12px", color: "#888", fontWeight: "bold", textTransform: "uppercase" }}>Chờ xác nhận</span>
          <h3 style={{ margin: "10px 0 0 0", fontSize: "28px", color: "#ffc107" }}>{pendingBookings}</h3>
        </div>

        {/* Ô 3: Tổng số dịch vụ */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderLeft: "5px solid #17a2b8" }}>
          <span style={{ fontSize: "12px", color: "#888", fontWeight: "bold", textTransform: "uppercase" }}>Loại dịch vụ</span>
          <h3 style={{ margin: "10px 0 0 0", fontSize: "28px", color: "#333" }}>{totalServices}</h3>
        </div>

        {/* Ô 4: Tổng số nhân sự */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderLeft: "5px solid #28a745" }}>
          <span style={{ fontSize: "12px", color: "#888", fontWeight: "bold", textTransform: "uppercase" }}>Đội ngũ nhân viên</span>
          <h3 style={{ margin: "10px 0 0 0", fontSize: "28px", color: "#333" }}>{totalStaff}</h3>
        </div>

      </div>

      {/* KHU VỰC 2: BẢNG LỊCH HẸN MỚI CẬP NHẬT */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginTop: 0, marginBottom: "15px", fontSize: "16px", color: "#444" }}>🔔 Lịch hẹn mới cập nhật</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee", color: "#666", fontSize: "14px" }}>
                <th style={{ padding: "12px 8px" }}>Khách hàng</th>
                <th style={{ padding: "12px 8px" }}>Dịch vụ</th>
                <th style={{ padding: "12px 8px" }}>Thời gian</th>
                <th style={{ padding: "12px 8px" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking, index) => (
                <tr key={booking.id || index} style={{ borderBottom: "1px solid #f2f2f2", fontSize: "14px" }}>
                  <td style={{ padding: "12px 8px", fontWeight: "bold" }}>{booking.customerName || "Khách vãng lai"}</td>
                  <td style={{ padding: "12px 8px" }}>{booking.serviceName || booking.service}</td>
                  <td style={{ padding: "12px 8px", color: "#555" }}>{booking.date} ({booking.time})</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      background: booking.status === "confirmed" ? "#e2f0d9" : booking.status === "pending" ? "#fff2cc" : "#fce4d6",
                      color: booking.status === "confirmed" ? "#385723" : booking.status === "pending" ? "#7f6000" : "#c65911"
                    }}>
                      {booking.status === "confirmed" ? "Đã duyệt" : booking.status === "pending" ? "Chờ" : booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}