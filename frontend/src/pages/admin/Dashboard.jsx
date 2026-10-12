import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const money = value => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [message, setMessage] = useState("");

    const load = async () => {
        try { setData((await api.get("/dashboard")).data); setMessage(""); }
        catch (e) { setMessage(e.response?.data?.message || "Không tải được thống kê."); }
    };
    useEffect(() => { load(); }, []);

    return <main className="container page admin-dashboard-page">
        <div className="page-title-row">
            <div><span className="section-kicker">TRUNG TÂM QUẢN TRỊ</span><h1>Dashboard doanh thu</h1><p className="muted">Theo dõi hoạt động đặt lịch, doanh thu và tình hình vận hành.</p></div>
            <button className="outline-btn" onClick={load}>↻ Làm mới</button>
        </div>
        {message && <div className="error">{message}</div>}
        {!data ? <div className="empty">Đang tải dữ liệu...</div> : <>
            <section className="analytics-grid">
                <div className="analytics-card highlight"><span>Doanh thu hoàn thành</span><strong>{money(data.revenue)}</strong><small>Chỉ tính lịch đã hoàn thành</small></div>
                <div className="analytics-card"><span>Doanh thu tháng này</span><strong>{money(data.monthlyRevenue)}</strong><small>Tháng hiện tại</small></div>
                <div className="analytics-card"><span>Giá trị lịch đã xác nhận</span><strong>{money(data.confirmedValue)}</strong><small>Đã xác nhận + hoàn thành</small></div>
            </section>
            <section className="analytics-grid compact">
                <div className="summary-card"><div className="summary-icon blue">👥</div><div><span>Khách hàng</span><strong>{data.users}</strong></div></div>
                <div className="summary-card"><div className="summary-icon purple">📅</div><div><span>Tổng lịch hẹn</span><strong>{data.appointments}</strong></div></div>
                <div className="summary-card"><div className="summary-icon orange">⏳</div><div><span>Chờ xác nhận</span><strong>{data.pending}</strong></div></div>
                <div className="summary-card"><div className="summary-icon green">✓</div><div><span>Đã hoàn thành</span><strong>{data.completed}</strong></div></div>
            </section>
            <section className="admin-module-links">
                <Link to="/admin/customers"><strong>👥 Quản lý khách hàng</strong><span>Xem số lượt đặt, chi tiêu và thông tin khách.</span></Link>
                <Link to="/admin/bookings"><strong>📋 Lịch hẹn</strong><span>Xếp nhân viên và cập nhật trạng thái.</span></Link>
                <Link to="/admin/staff"><strong>🧑‍💼 Quản lý nhân viên</strong><span>Thêm, sửa, xóa hồ sơ nhân viên và cập nhật trạng thái làm việc.</span></Link>
                <Link to="/admin/schedules"><strong>🗓️ Ca làm & lịch nghỉ</strong><span>Phân ca theo ngày, thiết lập giờ làm và sắp xếp ngày nghỉ cho nhân viên.</span></Link>
            </section>
        </>}
    </main>;
}