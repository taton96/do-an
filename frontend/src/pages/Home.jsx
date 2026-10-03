import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialServices } from "../data";

const serviceSlugs = {
  "Cắt tóc": "cat-toc",
  "Massage": "massage",
  "Chăm sóc da": "cham-soc-da",
  "Chăm sóc sức khỏe": "cham-soc-suc-khoe"
};

export default function Home() {
  const navigate = useNavigate();
  const services = initialServices.slice(0, 4);
  const [quickPhone, setQuickPhone] = useState("");
  const [quickPhoneError, setQuickPhoneError] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingSent, setRatingSent] = useState(false);

  const handleQuickBooking = (event) => {
    event.preventDefault();
    const phone = quickPhone.trim();

    if (!/^(0|\\+84)[0-9\\s.-]{8,14}$/.test(phone)) {
      setQuickPhoneError("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setQuickPhoneError("");
    navigate(`/booking?phone=${encodeURIComponent(phone)}`);
  };

  return (
    <main className="home-page">
      <section className="home-banner-wrap">
        <div className="home-banner">
          <img src="/images/services/dich-vu-4-nhom-3d.jpg" alt="Bốn nhóm dịch vụ" />
          <div className="home-banner-overlay">
            <span className="home-banner-badge">ĐẶT LỊCH ONLINE</span>
            <h1>Chăm sóc toàn diện<br />trong một lần đặt lịch</h1>
            <p>Cắt tóc · Massage · Chăm sóc da · Chăm sóc sức khỏe</p>
            <button className="home-primary-btn" onClick={() => navigate("/booking")}>ĐẶT LỊCH NGAY</button>
          </div>
        </div>
        <div className="banner-dots" aria-hidden="true"><span className="active" /><span /><span /><span /><span /></div>
      </section>

      <section className="quick-booking container">
        <div className="quick-booking-box">
          <div className="quick-booking-copy">
            <span className="quick-booking-kicker">ĐẶT LỊCH ONLINE</span>
            <strong>ĐẶT LỊCH GIỮ CHỖ</strong>
            <span>Nhập số điện thoại để bắt đầu đặt lịch nhanh.</span>
          </div>

          <form className="quick-booking-form" onSubmit={handleQuickBooking}>
            <label htmlFor="quick-phone" className="sr-only">Số điện thoại</label>
            <input
              id="quick-phone"
              type="tel"
              value={quickPhone}
              onChange={(event) => {
                setQuickPhone(event.target.value);
                setQuickPhoneError("");
              }}
              placeholder="Nhập SĐT để đặt lịch"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(quickPhoneError)}
            />
            <button type="submit">ĐẶT LỊCH NGAY</button>
          </form>

          {quickPhoneError && <small className="quick-phone-error">{quickPhoneError}</small>}
        </div>
        <div className="quick-review">
          <div className="quick-review-heading">
            <span className="review-icon">★</span>
            <div>
              <strong>ĐÁNH GIÁ CHẤT LƯỢNG PHỤC VỤ</strong>
              <p>Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>
            </div>
          </div>
          <div className="rating-stars" role="radiogroup" aria-label="Đánh giá chất lượng phục vụ">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={value <= rating ? "rating-star active" : "rating-star"}
                onClick={() => { setRating(value); setRatingSent(true); }}
                aria-label={`${value} sao`}
                aria-pressed={value <= rating}
              >
                ★
              </button>
            ))}
          </div>
          <div className="rating-status">
            {ratingSent ? `Bạn đã chọn ${rating}/5 sao. Cảm ơn bạn!` : "Chạm vào số sao bạn muốn đánh giá"}
          </div>
        </div>
      </section>

      <section className="container home-service-section" id="dich-vu">
        <div className="home-section-heading center-heading">
          <div>
           
            <h1> Chào mừng bạn đến với chúng tôi</h1>
           
          
          </div>
        </div>

        <div className="home-service-grid">
          {services.map((service, index) => (
            <article className="home-service-card" id={`service-${service.id}`} key={service.id}>
              <div className="home-service-image">
                <img src={service.image} alt={service.name} />
                <span className="service-index">0{index + 1}</span>
              </div>
              <div className="home-service-content">
                <span className="service-tag">DỊCH VỤ {String(index + 1).padStart(2, "0")}</span>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="home-service-price"><span>Từ</span><strong>{Number(service.price || 0).toLocaleString("vi-VN")}đ</strong></div>
                <button className="home-book-btn full-home-book" onClick={() => navigate(`/booking/${serviceSlugs[service.name]}`)}>ĐẶT LỊCH {service.name.toUpperCase()}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-intro-strip">
        <div className="container home-intro-inner">
          <div className="home-intro-copy">
            <span className="section-kicker">GIỚI THIỆU</span>
            <h2>Chăm sóc bản thân theo cách đơn giản hơn</h2>
            <p className="home-intro-lead">Một điểm đến cho những nhu cầu chăm sóc tóc, thư giãn, làn da và sức khỏe. Bạn chỉ cần chọn dịch vụ, thời gian phù hợp và đặt lịch ngay trên website.</p>
            <div className="intro-checks">
              <span>✓ Đặt lịch nhanh chóng</span>
              <span>✓ Chọn nhân viên phù hợp</span>
              <span>✓ Thanh toán thuận tiện</span>
              <span>✓ Theo dõi lịch đặt dễ dàng</span>
            </div>
            <button className="intro-cta" onClick={() => navigate("/booking")}>KHÁM PHÁ DỊCH VỤ <span>→</span></button>
          </div>
          <div className="home-intro-benefits">
            <div className="intro-benefit intro-benefit-main">
              <span className="intro-benefit-icon">✦</span>
              <strong>4 nhóm dịch vụ</strong>
              <p>Cắt tóc · Massage · Chăm sóc da · Chăm sóc sức khỏe</p>
            </div>
            <div className="intro-benefit">
              <span className="intro-mini-icon">01</span>
              <div><strong>Chọn dịch vụ</strong><p>Danh sách dịch vụ rõ ràng, có giá và thời gian.</p></div>
            </div>
            <div className="intro-benefit">
              <span className="intro-mini-icon">02</span>
              <div><strong>Chọn lịch</strong><p>Chọn nhân viên, ngày và khung giờ phù hợp.</p></div>
            </div>
            <div className="intro-benefit">
              <span className="intro-mini-icon">03</span>
              <div><strong>Hoàn tất</strong><p>Nhập thông tin và nhận xác nhận đặt lịch.</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
