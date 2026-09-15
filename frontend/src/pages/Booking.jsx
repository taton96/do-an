import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000/api";

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);

  const [form, setForm] = useState({
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // LẤY DANH SÁCH DỊCH VỤ
  // GET /api/services
  // ============================================================
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch(`${API_URL}/services`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải dịch vụ");
        }

        setServices(
          data.filter((service) => service.active !== false)
        );
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadServices();
  }, []);

  // ============================================================
  // LẤY DANH SÁCH NHÂN VIÊN
  // GET /api/employees
  // ============================================================
  useEffect(() => {
    async function loadStaff() {
      try {
        const response = await fetch(`${API_URL}/employees`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải nhân viên");
        }

        setStaff(data);
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadStaff();
  }, []);

  // ============================================================
  // LẤY KHUNG GIỜ TRỐNG
  // GET /api/schedules/slots
  // ============================================================
  useEffect(() => {
    async function loadSlots() {
      if (!form.serviceId || !form.staffId || !form.date) {
        setSlots([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          service: form.serviceId,
          employee: form.staffId,
          date: form.date,
        });

        const response = await fetch(
          `${API_URL}/schedules/slots?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải khung giờ");
        }

        setSlots(data);
      } catch (error) {
        setSlots([]);
        setMessage(error.message);
      }
    }

    loadSlots();
  }, [form.serviceId, form.staffId, form.date]);

  // ============================================================
  // CẬP NHẬT FORM
  // ============================================================
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,

      // Khi đổi ngày thì xóa giờ đã chọn
      ...(name === "date" && { time: "" }),

      // Khi đổi nhân viên thì xóa giờ đã chọn
      ...(name === "staffId" && { time: "" }),

      // Khi đổi dịch vụ thì xóa giờ đã chọn
      ...(name === "serviceId" && { time: "" }),
    }));

    setMessage("");
  }

  // ============================================================
  // ĐẶT LỊCH
  // POST /api/appointments
  // ============================================================
  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    // Kiểm tra dữ liệu nhập
    if (
      !form.serviceId ||
      !form.staffId ||
      !form.date ||
      !form.time
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({
          service: form.serviceId,
          employee: form.staffId,
          date: form.date,
          time: form.time,
          note: form.note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đặt lịch thất bại.");
      }

      // Đặt lịch thành công
      alert("Đặt lịch thành công!");

      navigate("/my-bookings");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // GIAO DIỆN
  // ============================================================
  return (
    <main className="container page">
      <div className="formbox">
        <h1>Đặt lịch dịch vụ</h1>

        {message && (
          <div className="error">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* DỊCH VỤ */}
          <label>
            Dịch vụ

            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              required
            >
              <option value="">
                -- Chọn dịch vụ --
              </option>

              {services.map((service) => (
                <option
                  key={service._id}
                  value={service._id}
                >
                  {service.name} -{" "}
                  {Number(service.price).toLocaleString("vi-VN")}đ
                </option>
              ))}
            </select>
          </label>


          {/* NHÂN VIÊN */}
          <label>
            Nhân viên

            <select
              name="staffId"
              value={form.staffId}
              onChange={handleChange}
              required
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
          </label>


          {/* NGÀY */}
          <label>
            Ngày

            <input
              type="date"
              name="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>


          {/* GIỜ */}
          <label>
            Giờ

            <select
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              disabled={!slots.length}
            >
              <option value="">
                {slots.length
                  ? "-- Chọn giờ trống --"
                  : "-- Không có giờ trống --"}
              </option>

              {slots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>


          {/* GHI CHÚ */}
          <label>
            Ghi chú

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Ghi chú thêm..."
              rows="4"
            />
          </label>


          {/* NÚT ĐẶT LỊCH */}
          <button
            className="btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Đang đặt lịch..."
              : "Xác nhận đặt lịch"}
          </button>

        </form>
      </div>
    </main>
  );
}