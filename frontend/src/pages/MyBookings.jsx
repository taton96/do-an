import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api";

const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

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

      if (!response.ok) {
        throw new Error(data.message || "Không thể tải lịch đặt");
      }

      setList(data);
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể hủy lịch");
      }

      loadBookings();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="container page">
      <h1>Lịch đặt của tôi</h1>

      {message && <div className="error">{message}</div>}

      {!list.length ? (
        <div className="empty">Bạn chưa có lịch đặt nào.</div>
      ) : (
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Nhân viên</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Trạng thái</th>\n                <th>Thanh toán</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {list.map((booking) => {
                const services =
                  booking.services?.length
                    ? booking.services
                    : booking.service
                      ? [booking.service]
                      : [];

                return (
                  <tr key={booking._id}>
                    <td>
                      {services.map((service) => service.name).join(" + ") ||
                        "Không có dịch vụ"}
                    </td>
                    <td>{booking.employee?.name || "Chưa phân công"}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>
                      <span className={`status ${booking.status}`}>
                        {labels[booking.status] || booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.paymentMethod === "qr" ? "📱 Quét mã QR" : "💵 Tiền mặt tại quầy"}
                      <br/><small>{booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</small>
                    </td>
                    <td>
                      {!["completed", "cancelled"].includes(booking.status) && (
                        <button
                          className="danger"
                          onClick={() => cancel(booking._id)}
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
