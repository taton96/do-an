import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { initialServices } from "../data";

const SERVICE_SLUGS = {
  "cat-toc": "Cắt tóc",
  "massage": "Massage",
  "cham-soc-da": "Chăm sóc da",
  "cham-soc-suc-khoe": "Chăm sóc sức khỏe"
};

const SERVICE_META = {
  "cat-toc": {
    kicker: "BOOKING CẮT TÓC",
    title: "Đặt lịch Cắt tóc",
    description: "Chọn gói cắt tóc phù hợp, số điện thoại, mục phụ, nhân viên và khung giờ bạn mong muốn.",
    image: "/images/services/cat-toc-3d.jpg",
    className: "booking-cat-toc"
  },
  "massage": {
    kicker: "BOOKING MASSAGE",
    title: "Đặt lịch Massage",
    description: "Thư giãn với các lựa chọn massage phù hợp và đặt lịch theo thời gian thuận tiện.",
    image: "/images/services/massage-3d.jpg",
    className: "booking-massage"
  },
  "cham-soc-da": {
    kicker: "BOOKING CHĂM SÓC DA",
    title: "Đặt lịch Chăm sóc da",
    description: "Chọn liệu trình chăm sóc da, mục phụ và nhân viên trước khi xác nhận lịch.",
    image: "/images/services/cham-soc-da-3d.jpg",
    className: "booking-cham-soc-da"
  },
  "cham-soc-suc-khoe": {
    kicker: "BOOKING CHĂM SÓC SỨC KHỎE",
    title: "Đặt lịch Chăm sóc sức khỏe",
    description: "Đặt lịch tư vấn và chăm sóc sức khỏe theo nhu cầu của bạn.",
    image: "/images/services/cham-soc-suc-khoe-3d.jpg",
    className: "booking-cham-soc-suc-khoe"
  }
};

const STEPS = [
  "Chọn dịch vụ",
  "Số điện thoại",
  "Chọn mục phụ",
  "Chọn nhân viên",
  "Ngày / giờ",
  "Thanh toán",
  "Xác nhận"
];

const normalizeService = (service) => ({
  ...service,
  _id: service._id || service.id,
  name: service.name || "Dịch vụ",
  duration: Number(service.duration || 0),
  price: Number(service.price || 0),
  active: service.active !== false && service.status !== "inactive",
  image: service.image || "/images/services/cat-toc.svg",
  subServices: Array.isArray(service.subServices) ? service.subServices : []
});

export default function Booking() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { serviceSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [step, setStep] = useState(serviceSlug ? 0 : -1);
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [form, setForm] = useState({
    name: "",
    phone: searchParams.get("phone") || "",
    staffId: "",
    date: "",
    time: "",
    note: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoadingData(true);
      try {
        const [serviceRes, employeeRes] = await Promise.all([
          api.get("/services"),
          api.get("/employees")
        ]);

        if (!mounted) return;

        const apiServices = Array.isArray(serviceRes.data)
          ? serviceRes.data.map(normalizeService).filter(s => s.active)
          : [];
        const fallbackServices = initialServices.map(normalizeService).filter(s => s.active);
        setServices(apiServices.length ? apiServices : fallbackServices);
        setStaff(Array.isArray(employeeRes.data) ? employeeRes.data : []);
      } catch (err) {
        if (!mounted) return;
        setServices(initialServices.map(normalizeService).filter(s => s.active));
        setStaff([]);
        setMessage("Không thể tải dữ liệu từ máy chủ. Đang dùng dữ liệu dịch vụ mẫu.");
      } finally {
        if (mounted) setLoadingData(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  const selectedService = useMemo(() => {
    if (!serviceSlug) return null;
    const wantedName = SERVICE_SLUGS[serviceSlug];
    return services.find(s => s.name === wantedName) || null;
  }, [services, serviceSlug]);

  const serviceMeta = SERVICE_META[serviceSlug] || {};
  const serviceStaff = useMemo(() => {
    if (!selectedService) return staff;
    const matched = staff.filter(employee => {
      const specialty = String(employee.specialty || employee.department || "").toLowerCase();
      return specialty.includes(String(selectedService.name || "").toLowerCase());
    });
    return matched.length ? matched : staff;
  }, [staff, selectedService]);

  const selectedSubTotal = selectedSubServices.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalPrice = Number(selectedService?.price || 0) + selectedSubTotal;
  const totalDuration = Number(selectedService?.duration || 0);

  useEffect(() => {
    if (!selectedService || !form.staffId || !form.date) {
      setSlots([]);
      return;
    }

    api.get("/schedules/slots", {
      params: {
        services: selectedService._id,
        employee: form.staffId,
        date: form.date
      }
    })
      .then(r => setSlots(Array.isArray(r.data) ? r.data : []))
      .catch(err => {
        setSlots([]);
        setMessage(err.response?.data?.message || "Không thể tải khung giờ.");
      });
  }, [selectedService, form.staffId, form.date]);

  const toggleSubService = (sub) => {
    setSelectedSubServices(current => {
      const exists = current.some(item => item.name === sub.name);
      if (exists) return current.filter(item => item.name !== sub.name);
      return [{ mainService: selectedService._id, name: sub.name, price: Number(sub.price || 0) }, ...current];
    });
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm(current => ({
      ...current,
      [name]: value,
      ...(name === "date" || name === "staffId" ? { time: "" } : {})
    }));
    setMessage("");
  };

  const chooseService = (service) => {
    const slug = Object.keys(SERVICE_SLUGS).find(key => SERVICE_SLUGS[key] === service.name);
    if (slug) {
      const phone = form.phone.trim();
      navigate(`/booking/${slug}${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`);
    }
  };

  const next = () => {
    setMessage("");

    if (step === 0 && !selectedService) return setMessage("Vui lòng chọn một dịch vụ.");
    if (step === 1 && !/^(0|\+84)[0-9\s.-]{8,14}$/.test(form.phone.trim())) {
      return setMessage("Vui lòng nhập số điện thoại hợp lệ trước khi tiếp tục.");
    }
    if (step === 3 && !form.staffId) return setMessage("Vui lòng chọn nhân viên.");
    if (step === 4 && (!form.date || !form.time)) return setMessage("Vui lòng chọn ngày và giờ.");

    setStep(current => Math.min(current + 1, 5));
  };

  const back = () => {
    setMessage("");
    if (step === 0) return navigate("/booking");
    setStep(current => Math.max(current - 1, 0));
  };

  async function confirmBooking() {
    if (!form.name.trim()) {
      setMessage("Vui lòng nhập họ tên.");
      setStep(0);
      return;
    }
    if (!/^(0|\+84)[0-9\s.-]{8,14}$/.test(form.phone.trim())) {
      setMessage("Vui lòng nhập số điện thoại hợp lệ.");
      setStep(0);
      return;
    }
    if (!selectedService || !form.staffId || !form.date || !form.time) {
      setMessage("Thông tin đặt lịch chưa đầy đủ.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/appointments", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        services: [selectedService._id],
        employee: form.staffId,
        date: form.date,
        time: form.time,
        note: form.note,
        selectedSubServices,
        paymentMethod
      });

      setAppointment(response.data?.appointment || null);
      setAccountCreated(Boolean(response.data?.accountCreated));
      setTemporaryPassword(response.data?.temporaryPassword || "");
      setAccountInfo(response.data?.auth?.user || null);
      if (response.data?.auth) setSession(response.data.auth);
      setStep(6);
    } catch (err) {
      setMessage(err.response?.data?.message || "Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  if (!serviceSlug) {
    return (
      <main className="container booking-service-picker">
        <div className="booking-page-head">
          <span>ĐẶT LỊCH</span>
          <h1>Chọn dịch vụ bạn muốn đặt</h1>
          <p>Mỗi dịch vụ có một trang đặt lịch riêng để bạn chọn nhân viên, ngày giờ và thanh toán.</p>
        </div>

        {loadingData ? <div className="loading">Đang tải dịch vụ...</div> : (
          <div className="booking-service-grid">
            {services.map(service => (
              <article className="booking-service-card" key={service._id}>
                <img src={service.image} alt={service.name} />
                <div>
                  <span>DỊCH VỤ</span>
                  <h2>{service.name}</h2>
                  <p>{service.description}</p>
                  <strong>Từ {service.price.toLocaleString("vi-VN")}đ</strong>
                  <button className="btn" onClick={() => chooseService(service)}>Đặt lịch {service.name}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    );
  }

  if (!SERVICE_SLUGS[serviceSlug]) {
    return <main className="container page"><div className="error">Dịch vụ không tồn tại.</div></main>;
  }

  return (
    <main className={`container booking-wizard-page ${serviceMeta.className || ""}`}>
      <div className="booking-category-hero">
        <div className="booking-category-copy">
          <Link to="/booking" className="back-service">← Chọn dịch vụ khác</Link>
          <span className="booking-category-kicker">{serviceMeta.kicker}</span>
          <h1>{serviceMeta.title || `Đặt lịch ${selectedService?.name || "dịch vụ"}`}</h1>
          <p>{serviceMeta.description || selectedService?.description}</p>
          {selectedService && <div className="booking-category-price">Từ <b>{Number(selectedService.price || 0).toLocaleString("vi-VN")}đ</b> · {selectedService.duration} phút</div>}
        </div>
        <div className="booking-category-image">
          <img src={serviceMeta.image || selectedService?.image} alt={selectedService?.name || "Dịch vụ"} />
        </div>
      </div>

      <div className="booking-stepper">
        {STEPS.map((label, index) => (
          <div className={`booking-step ${index === step ? "current" : ""} ${index < step ? "done" : ""}`} key={label}>
            <span>{index < step ? "✓" : index + 1}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      {message && <div className="error booking-message">{message}</div>}

      <section className="booking-wizard-card">
        {loadingData ? <div className="loading">Đang tải dữ liệu...</div> : (
          <>
            {step === 0 && (
              <div className="wizard-section category-service-step">
                <div className="category-step-title">
                  <div>
                    <span className="section-kicker">BƯỚC 1</span>
                    <h2>Chọn dịch vụ</h2>
                    <p className="wizard-help">Bạn đang đặt lịch cho nhóm <b>{selectedService?.name}</b>. Kiểm tra dịch vụ trước khi nhập số điện thoại.</p>
                  </div>
                  <span className="category-badge">{selectedService?.duration} phút</span>
                </div>
                {selectedService && (
                  <article className="category-main-service-card">
                    <img src={selectedService.image} alt={selectedService.name} />
                    <div className="category-main-service-info">
                      <span>DỊCH VỤ ĐANG CHỌN</span>
                      <h3>{selectedService.name}</h3>
                      <p>{selectedService.description}</p>
                      <strong>{Number(selectedService.price || 0).toLocaleString("vi-VN")}đ</strong>
                    </div>
                  </article>
                )}
                <div className="category-sub-preview">
                  <h3>Các mục phụ của {selectedService?.name}</h3>
                  <div className="category-mini-grid">
                    {(selectedService?.subServices || []).map((sub, index) => (
                      <div className="category-mini-card" key={`${sub.name}-${index}`}>
                        <span>✓</span><div><b>{sub.name}</b><small>{Number(sub.price || 0).toLocaleString("vi-VN")}đ</small></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="wizard-section narrow-wizard">
                <h2>2. Nhập số điện thoại</h2>
                <p className="wizard-help">Nhập số điện thoại để cửa hàng có thể liên hệ xác nhận lịch đặt.</p>
                <label className="big-input-label">Số điện thoại <span className="required-mark">*</span>
                  <input type="tel" name="phone" value={form.phone} onChange={change} placeholder="Ví dụ: 0901234567" inputMode="tel" autoComplete="tel" required />
                </label>
                
                <label className="big-input-label">Họ tên
                  <input type="text" name="name" value={form.name} onChange={change} placeholder="Nhập họ và tên" autoComplete="name" required />
                </label>
                <label className="big-input-label">Ghi chú (không bắt buộc)
                  <textarea name="note" rows="3" value={form.note} onChange={change} placeholder="Bạn có yêu cầu gì thêm không?" />
                </label>
              </div>
            )}

            {step === 2 && (

              <div className="wizard-section">
                <h2>3. Chọn mục phụ</h2>
                <p className="wizard-help">Bạn có thể chọn thêm các dịch vụ phụ thuộc {selectedService?.name}.</p>
                <div className="subservice-list wizard-subservices service-specific-subservices">
                  {(selectedService?.subServices || []).map((sub, index) => {
                    const checked = selectedSubServices.some(item => item.name === sub.name);
                    return (
                      <label className={`subservice-option ${checked ? "selected" : ""}`} key={`${sub.name}-${index}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleSubService(sub)} />
                        <span className="subservice-name">{sub.name}</span>
                        <strong>+{Number(sub.price || 0).toLocaleString("vi-VN")}đ</strong>
                      </label>
                    );
                  })}
                </div>
                {!selectedService?.subServices?.length && <div className="wizard-note">Dịch vụ này chưa có mục phụ. Bạn có thể tiếp tục.</div>}
                <div className="wizard-total">Tổng dự kiến: <b>{totalPrice.toLocaleString("vi-VN")}đ</b></div>
              </div>
            )}

            {step === 3 && (
              <div className="wizard-section">
                <h2>4. Chọn nhân viên</h2>
                <p className="wizard-help">Chọn nhân viên phục vụ cho {selectedService?.name}.</p>
                <div className="staff-choice-grid">
                  {serviceStaff.length ? serviceStaff.map(employee => (
                    <button type="button" className={`staff-choice ${form.staffId === employee._id ? "selected" : ""}`} key={employee._id} onClick={() => setForm(current => ({ ...current, staffId: employee._id, time: "" }))}>
                      <span className="staff-avatar">{(employee.name || "N").charAt(0).toUpperCase()}</span>
                      <strong>{employee.name}</strong>
                      <small>Nhân viên phục vụ</small>
                      {form.staffId === employee._id && <b className="staff-check">✓</b>}
                    </button>
                  )) : <div className="empty-state">Chưa có nhân viên. Vui lòng thêm nhân viên trong trang quản trị.</div>}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="wizard-section">
                <h2>5. Chọn ngày và giờ</h2>
                <p className="wizard-help">Chọn ngày và một khung giờ còn trống.</p>
                <div className="date-time-grid">
                  <label>Ngày
                    <input type="date" name="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={change} />
                  </label>
                  <label>Giờ
                    <select name="time" value={form.time} onChange={change}>
                      <option value="">-- Chọn giờ trống --</option>
                      {slots.map(time => <option value={time} key={time}>{time}</option>)}
                    </select>
                  </label>
                </div>
                {!form.staffId && <div className="wizard-note">Hãy quay lại bước chọn nhân viên trước.</div>}
                {form.staffId && form.date && !slots.length && <div className="wizard-note">Không có khung giờ trống trong ngày này.</div>}
              </div>
            )}

            {step === 5 && (
              <div className="wizard-section">
                <h2>6. Thanh toán</h2>
                <p className="wizard-help">Chọn phương thức thanh toán cho lịch {selectedService?.name}.</p>
                <div className="payment-choice-grid">
                  <button type="button" className={`payment-card ${paymentMethod === "cash" ? "selected" : ""}`} onClick={() => setPaymentMethod("cash")}>
                    <span>💵</span><div><strong>Tiền mặt tại quầy</strong><small>Thanh toán khi đến cửa hàng.</small></div>
                  </button>
                  <button type="button" className={`payment-card ${paymentMethod === "qr" ? "selected" : ""}`} onClick={() => setPaymentMethod("qr")}>
                    <span>📱</span><div><strong>Quét mã QR</strong><small>Thanh toán bằng mã QR.</small></div>
                  </button>
                </div>
                {paymentMethod === "qr" && <div className="wizard-qr"><img src="/images/qr-payment.svg" alt="QR thanh toán" /><div><b>{totalPrice.toLocaleString("vi-VN")}đ</b><p>Quét mã QR để thanh toán. Đây là mã thanh toán demo.</p></div></div>}
                <div className="wizard-order-summary">
                  <span>{selectedService?.name}</span><b>{totalPrice.toLocaleString("vi-VN")}đ</b>
                  <small>{form.date} · {form.time} · {form.phone}</small>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="wizard-confirmation">
                <div className="confirm-icon">✓</div>
                <span>ĐẶT LỊCH THÀNH CÔNG</span>
                <h2>Cảm ơn bạn đã đặt lịch!</h2>
                <p>Thông tin đặt lịch đã được ghi nhận. Tài khoản khách hàng cũng đã được đăng ký và đăng nhập tự động.</p>
                {accountCreated && temporaryPassword && (
                  <div className="account-created-note">
                    <strong>✓ Tài khoản đã được tạo tự động</strong>
                    <span>Số điện thoại đăng nhập: <b>{accountInfo?.phone || form.phone}</b></span>
                    <span>Mật khẩu tạm thời: <b>{temporaryPassword}</b></span>
                    <small>Bạn có thể dùng số điện thoại và mật khẩu này để đăng nhập lại. Lịch đặt sẽ tự động thuộc tài khoản của bạn.</small>
                  </div>
                )}
                <div className="confirm-card">
                  <div><span>Họ tên</span><b>{form.name}</b></div>
                  <div><span>Dịch vụ</span><b>{selectedService?.name}</b></div>
                  <div><span>Nhân viên</span><b>{staff.find(e => String(e._id) === String(form.staffId))?.name || "-"}</b></div>
                  <div><span>Ngày / giờ</span><b>{form.date} · {form.time}</b></div>
                  <div><span>Số điện thoại</span><b>{form.phone}</b></div>
                  <div><span>Thanh toán</span><b>{paymentMethod === "cash" ? "Tiền mặt tại quầy" : "Quét mã QR"}</b></div>
                  <div><span>Tổng tiền</span><b>{totalPrice.toLocaleString("vi-VN")}đ</b></div>
                </div>
                <div className="confirm-actions">
                  <button className="btn" onClick={() => navigate("/")}>Về trang chủ</button>
                  <button className="outline-btn" onClick={() => navigate("/booking")}>Đặt lịch khác</button>
                </div>
              </div>
            )}

            {step < 6 && (
              <div className="wizard-actions">
                <button type="button" className="outline-btn" onClick={back}>Quay lại</button>
                {step < 5 ? (
                  <button type="button" className="btn" onClick={next}>Tiếp tục →</button>
                ) : (
                  <button type="button" className="btn" onClick={confirmBooking} disabled={loading}>{loading ? "Đang xác nhận..." : "Xác nhận & đặt lịch"}</button>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
