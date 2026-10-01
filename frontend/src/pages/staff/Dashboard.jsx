// import {useState} from "react";import {useAuth} from "../../context/AuthContext";import {getData,saveData} from "../../data";const labels={pending:"Chờ xác nhận",confirmed:"Đã xác nhận",completed:"Hoàn thành",cancelled:"Đã hủy"};
// export default function Dashboard(){const {user}=useAuth();const staff=getData("staff",[]).find(x=>x.name===user.name)||getData("staff",[])[0];const [list,setList]=useState(()=>getData("bookings",[]).filter(b=>b.staffId===staff?.id));function update(id,status){const all=getData("bookings",[]).map(b=>b.id===id?{...b,status}:b);saveData("bookings",all);setList(all.filter(b=>b.staffId===staff?.id))}return <main className="container page"><h1>Lịch làm việc</h1><p>Nhân viên: <b>{staff?.name}</b></p>{!list.length?<div className="empty">Chưa có lịch được phân công.</div>:<div className="tablewrap"><table><thead><tr><th>Khách</th><th>Dịch vụ</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th><th></th></tr></thead><tbody>{list.map(b=><tr key={b.id}><td>{b.customerName}</td><td>{b.serviceName}</td><td>{b.date}</td><td>{b.time}</td><td><span className={"status "+b.status}>{labels[b.status]}</span></td><td>{b.status==="pending"&&<button onClick={()=>update(b.id,"confirmed")}>Xác nhận</button>}{b.status==="confirmed"&&<button onClick={()=>update(b.id,"completed")}>Hoàn thành</button>}</td></tr>)}</tbody></table></div>}</main>}


import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getData, saveData } from "../../data";

const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function Dashboard() {
  const { user } = useAuth();
  
  // Lấy thông tin nhân viên hiện tại
  const staff = getData("staff", []).find((x) => x.name === user?.name) || getData("staff", [])[0];
  
  // State danh sách lịch hẹn của nhân viên
  const [list, setList] = useState(() =>
    getData("bookings", []).filter((b) => b.staffId === staff?.id)
  );

  // Bộ lọc & Tìm kiếm
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cập nhật trạng thái lịch hẹn
  function updateStatus(id, newStatus) {
    const allBookings = getData("bookings", []);
    const updatedBookings = allBookings.map((b) =>
      b.id === id ? { ...b, status: newStatus } : b
    );
    
    saveData("bookings", updatedBookings);
    setList(updatedBookings.filter((b) => b.staffId === staff?.id));
  }

  // Danh sách sau khi áp dụng lọc & tìm kiếm
  const filteredList = list.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch =
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone?.includes(searchQuery);

    return matchStatus && matchSearch;
  });

  // Thống kê số lượng theo trạng thái
  const stats = {
    total: list.length,
    pending: list.filter((b) => b.status === "pending").length,
    confirmed: list.filter((b) => b.status === "confirmed").length,
    completed: list.filter((b) => b.status === "completed").length,
  };

  return (
    <main className="container page">
      <div className="dashboard-header">
        <h1>Lịch làm việc</h1>
        <p>
          Nhân viên: <b>{staff?.name || "Chưa xác định"}</b> | Chuyên môn: <span>{staff?.role || "Kỹ thuật viên"}</span>
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Tổng số lịch</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Chờ xác nhận</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card confirmed">
          <span className="stat-label">Đã xác nhận</span>
          <span className="stat-value">{stats.confirmed}</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-label">Hoàn thành</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
      </div>

      {/* Thanh lọc & tìm kiếm */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm theo tên khách, SĐT, dịch vụ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="status-tabs">
          <button
            className={filterStatus === "all" ? "active" : ""}
            onClick={() => setFilterStatus("all")}
          >
            Tất cả ({list.length})
          </button>
          <button
            className={filterStatus === "pending" ? "active" : ""}
            onClick={() => setFilterStatus("pending")}
          >
            Chờ xác nhận
          </button>
          <button
            className={filterStatus === "confirmed" ? "active" : ""}
            onClick={() => setFilterStatus("confirmed")}
          >
            Đã xác nhận
          </button>
          <button
            className={filterStatus === "completed" ? "active" : ""}
            onClick={() => setFilterStatus("completed")}
          >
            Hoàn thành
          </button>
          <button
            className={filterStatus === "cancelled" ? "active" : ""}
            onClick={() => setFilterStatus("cancelled")}
          >
            Đã hủy
          </button>
        </div>
      </div>

      {/* Bảng danh sách lịch hẹn */}
      {!filteredList.length ? (
        <div className="empty">Không tìm thấy lịch làm việc nào phù hợp.</div>
      ) : (
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Dịch vụ</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((b) => (
                <tr key={b.id}>
                  <td><b>{b.customerName}</b></td>
                  <td>{b.customerPhone || "---"}</td>
                  <td>{b.serviceName}</td>
                  <td>{b.date}</td>
                  <td><b>{b.time}</b></td>
                  <td>{b.note || "Không có"}</td>
                  <td>
                    <span className={`status ${b.status}`}>
                      {labels[b.status] || b.status}
                    </span>
                  </td>
                  <td className="actions">
                    {b.status === "pending" && (
                      <>
                        <button
                          className="btn-confirm"
                          onClick={() => updateStatus(b.id, "confirmed")}
                        >
                          Xác nhận
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => updateStatus(b.id, "cancelled")}
                        >
                          Hủy
                        </button>
                      </>
                    )}

                    {b.status === "confirmed" && (
                      <>
                        <button
                          className="btn-complete"
                          onClick={() => updateStatus(b.id, "completed")}
                        >
                          Hoàn thành
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => updateStatus(b.id, "cancelled")}
                        >
                          Hủy
                        </button>
                      </>
                    )}

                    {(b.status === "completed" || b.status === "cancelled") && (
                      <span className="text-muted">Không có thao tác</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}