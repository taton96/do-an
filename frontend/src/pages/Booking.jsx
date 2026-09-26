import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { initialServices } from "../data";

export default function Booking() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [form, setForm] = useState({ staffId: "", date: "", time: "", note: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Chuẩn hóa dữ liệu dịch vụ để Booking hoạt động với cả dữ liệu MongoDB cũ
  // (active) và dữ liệu cũ của frontend (status: "active").
  const normalizeService = (service) => ({
    ...service,
    _id: service._id || service.id,
    name: service.name || "Dịch vụ",
    duration: Number(service.duration || 0),
    price: Number(service.price || 0),
    active: service.active !== false && service.status !== "inactive",
    image: service.image || "/images/services/cat-toc.svg"
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoadingData(true);
      setMessage("");
      try {
        const [serviceRes, employeeRes] = await Promise.all([
          api.get("/services"),
          api.get("/employees")
        ]);

        if (!mounted) return;

        const serviceData = Array.isArray(serviceRes.data)
          ? serviceRes.data.map(normalizeService)
          : [];

        setServices(serviceData.filter(s => s.active));

        const employeeData = Array.isArray(employeeRes.data)
          ? employeeRes.data
          : [];
        setStaff(employeeData);
      } catch (err) {
        if (!mounted) return;

        // Không để màn hình Booking trắng nếu API dịch vụ tạm thời chưa phản hồi.
        // Dữ liệu mẫu chỉ là fallback; khi API hoạt động, MongoDB luôn được ưu tiên.
        setServices(initialServices.map(normalizeService).filter(s => s.active));
        setStaff([]);
        setMessage(
          err.response?.data?.message ||
          "Không thể kết nối máy chủ. Đang hiển thị dịch vụ mẫu."
        );
      } finally {
        if (mounted) setLoadingData(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  const selectedServices = useMemo(
    () => services.filter(s => selectedServiceIds.includes(s._id)),
    [services, selectedServiceIds]
  );

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price || 0), 0
  );
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + Number(s.duration || 0), 0
  );

  const toggleService = (id) => {
    setSelectedServiceIds(cur =>
      cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]
    );
    setForm(x => ({ ...x, time: "" }));
    setMessage("");
  };

  useEffect(() => {
    if (!selectedServiceIds.length || !form.staffId || !form.date) {
      setSlots([]);
      return;
    }

    api.get("/schedules/slots", {
      params: {
        services: selectedServiceIds.join(","),
        employee: form.staffId,
        date: form.date
      }
    })
      .then(r => setSlots(Array.isArray(r.data) ? r.data : []))
      .catch(err => {
        setSlots([]);
        setMessage(
          err.response?.data?.message || "Không thể tải khung giờ."
        );
      });
  }, [selectedServiceIds, form.staffId, form.date]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm(x => ({
      ...x,
      [name]: value,
      ...((name === "date" || name === "staffId") ? { time: "" } : {})
    }));
    setMessage("");
  };

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    if (!selectedServiceIds.length || !form.staffId || !form.date || !form.time) {
      setMessage("Vui lòng chọn ít nhất một dịch vụ, nhân viên, ngày và giờ.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/appointments", {
        services: selectedServiceIds,
        employee: form.staffId,
        date: form.date,
        time: form.time,
        note: form.note,
        paymentMethod
      });

      alert(
        `Đặt lịch thành công!\n${selectedServices.map(s => s.name).join(" + ")}\n` +
        `${totalDuration} phút - ${totalPrice.toLocaleString("vi-VN")}đ\n` +
        `Thanh toán: ${paymentMethod === "cash" ? "Tiền mặt tại quầy" : "Quét mã QR"}`
      );

      navigate("/my-bookings");
    } catch (err) {
      setMessage(err.response?.data?.message || "Đặt lịch thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page">
      <div className="formbox booking-box">
        <h2>Đặt lịch dịch vụ</h2>
        {message && <div className="error">{message}</div>}

        {loadingData ? (
          <div className="loading">Đang tải danh sách dịch vụ...</div>
        ) : (
          <form onSubmit={submit}>
            <label>Dịch vụ</label>

            {services.length === 0 ? (
              <div className="empty-state">
                Hiện chưa có dịch vụ đang hoạt động.
              </div>
            ) : (
              <div className="service-select-grid">
                {services.map(service => {
                  const checked = selectedServiceIds.includes(service._id);

                  return (
                    <label
                      key={service._id}
                      className={`service-option ${checked ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(service._id)}
                      />

                      <img
                        src={service.image}
                        alt={service.name}
                        onError={(e) => {
                          e.currentTarget.src = "/images/services/cat-toc.svg";
                        }}
                      />

                      <span className="service-option-info">
                        <strong>{service.name}</strong>
                        <small>
                          {service.duration} phút ·{" "}
                          {Number(service.price || 0).toLocaleString("vi-VN")}đ
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {selectedServices.length > 0 && (
              <div className="booking-summary">
                <div>
                  <strong>Đã chọn {selectedServices.length} dịch vụ</strong>
                </div>

                <div className="chips">
                  {selectedServices.map(s => (
                    <span key={s._id}>{s.name}</span>
                  ))}
                </div>

                <div className="booking-total">
                  Tổng thời gian: <strong>{totalDuration} phút</strong>
                  {" · "}
                  Tổng tiền: <strong>{totalPrice.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>
            )}

            <label>
              Nhân viên
              <select
                name="staffId"
                value={form.staffId}
                onChange={change}
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {staff.map(e => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </select>
            </label>

            <label>
              Ngày
              <input
                type="date"
                name="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={change}
                required
              />
            </label>

            <label>
              Giờ
              <select
                name="time"
                value={form.time}
                onChange={change}
                required
              >
                <option value="">-- Chọn giờ trống --</option>
                {slots.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Ghi chú
              <textarea
                name="note"
                value={form.note}
                onChange={change}
                placeholder="Ghi chú thêm..."
                rows="4"
              />
            </label>

            <div className="payment-box">
              <h3>Phương thức thanh toán</h3>

              <label className={`payment-option ${paymentMethod === "cash" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                <span>
                  <strong>💵 Tiền mặt tại quầy</strong>
                  <small>Thanh toán khi đến cửa hàng.</small>
                </span>
              </label>

              <label className={`payment-option ${paymentMethod === "qr" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qr"
                  checked={paymentMethod === "qr"}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                <span>
                  <strong>📱 Quét mã QR</strong>
                  <small>Quét mã tại đây để thanh toán.</small>
                </span>
              </label>

              {paymentMethod === "qr" && (
                <div className="qr-panel">
                  <img src="/images/qr-payment.svg" alt="Mã QR thanh toán" />
                  <div>
                    <strong>Số tiền: {totalPrice.toLocaleString("vi-VN")}đ</strong>
                    <p>Mã QR hiện tại là mã demo.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn"
              type="submit"
              disabled={loading || !selectedServiceIds.length}
            >
              {loading ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
