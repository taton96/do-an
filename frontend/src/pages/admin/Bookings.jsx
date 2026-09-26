import { useEffect, useState } from "react";
import api from "../../api";

const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function Bookings() {
  const [list, setList] = useState([]);
  const [staff, setStaff] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [a, e] = await Promise.all([
        api.get("/appointments"),
        api.get("/employees"),
      ]);

      setList(Array.isArray(a.data) ? a.data : []);
      setStaff(Array.isArray(e.data) ? e.data : []);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Không tải được lịch hẹn."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Xếp nhân viên cho lịch hẹn
  const assign = async (id, employee) => {
    try {
      setMessage("");

      if (!employee) {
        setMessage("Vui lòng chọn nhân viên.");
        return;
      }

      await api.put(`/appointments/${id}/assign`, {
        employee,
      });

      await load();
      setMessage("Đã xếp nhân viên thành công.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Không thể xếp nhân viên."
      );
    }
  };

  // Đổi trạng thái lịch hẹn
  const status = async (id, value) => {
    try {
      setMessage("");

      await api.put(`/appointments/${id}/status`, {
        status: value,
      });

      await load();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Không thể đổi trạng thái."
      );
    }
  };

  return (
    <main className="container page">
      <h1>Quản lý lịch hẹn</h1>

      {message && <div className="error">{message}</div>}

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Nhân viên / Xếp ca</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Chưa có lịch hẹn
                </td>
              </tr>
            ) : (
              list.map((b) => (
                <tr key={b._id}>
                  {/* Khách hàng */}
                  <td>{b.customer?.name || "Không có thông tin"}</td>

                  {/* Dịch vụ */}
                  <td>
                    {(b.services?.length
                      ? b.services
                      : [b.service]
                    )
                      .filter(Boolean)
                      .map((x) => x.name)
                      .join(" + ")}
                  </td>

                  {/* Nhân viên */}
                  <td>
                    <select
                      value={b.employee?._id || ""}
                      onChange={(e) =>
                        assign(b._id, e.target.value)
                      }
                      disabled={b.status === "cancelled"}
                    >
                      <option value="">
                        -- Chọn nhân viên --
                      </option>

                      {staff.map((employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Ngày */}
                  <td>{b.date}</td>

                  {/* Giờ */}
                  <td>{b.time}</td>

                  {/* Trạng thái */}
                  <td>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        status(b._id, e.target.value)
                      }
                    >
                      <option value="pending">
                        {labels.pending}
                      </option>

                      <option value="confirmed">
                        {labels.confirmed}
                      </option>

                      <option value="completed">
                        {labels.completed}
                      </option>

                      <option value="cancelled">
                        {labels.cancelled}
                      </option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}