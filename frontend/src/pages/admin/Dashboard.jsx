import { Link } from "react-router-dom";
import { getData, initialServices, initialStaff } from "../../data";

export default function Dashboard() {
  const bookings = getData("bookings", []);
  const services = getData("services", initialServices);
  const staff = getData("staff", initialStaff);

  return (
    <main className="container page">
      <h1>Admin Dashboard</h1>
      <div className="stats">
        <div><b>{bookings.length}</b><span>Tổng lịch</span></div>
        <div><b>{bookings.filter(x => x.status === "pending").length}</b><span>Chờ xác nhận</span></div>
        <div><b>{bookings.filter(x => x.status === "completed").length}</b><span>Hoàn thành</span></div>
        <div><b>{services.length}</b><span>Dịch vụ</span></div>
        <div><b>{staff.length}</b><span>Nhân viên</span></div>
      </div>

      <div className="adminlinks">
        <Link to="/admin/services">Quản lý dịch vụ</Link>
        <Link to="/admin/staff">Quản lý nhân viên</Link>
        <Link to="/admin/bookings">Quản lý lịch hẹn</Link>
        <Link to="/admin/schedules">Ca làm & ngày nghỉ</Link>
      </div>
    </main>
  );
}
