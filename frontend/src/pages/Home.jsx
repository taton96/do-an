import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { initialServices } from "../data";

export default function Home() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return <>
    <section className="hero hero-3d">
      <div className="hero-content">
        <div className="hero-copy">
          <span className="badge">ĐẶT LỊCH ONLINE</span>
          <h1>Chăm sóc toàn diện<br />trong một nơi</h1>
          <p>4 dịch vụ chính · nhiều lựa chọn chăm sóc · đặt lịch nhanh chóng</p>
          <Link to="/booking" className="btn">Đặt lịch ngay</Link>
        </div>
        <div className="hero-3d-poster">
          <img src="/images/services/dich-vu-4-nhom-3d.jpg" alt="4 dịch vụ chính minh họa 3D" />
        </div>
      </div>
    </section>

    <section className="container home-services">
      <div className="section-title">
        <div><h1>DỊCH VỤ NỔI BẬT</h1></div>
        <Link to="/services">Xem tất cả →</Link>
      </div>
      <div className="service-main-grid compact">
        {initialServices.slice(0, 4).map(service => (
          <article
            className="main-service-card clickable-service"
            key={service.id}
            onClick={() => setSelected(service)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setSelected(service)}
          >
            <div className="main-service-image">
              <img src={service.image} alt={service.name} />
            </div>
            <div className="main-service-body">
            
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <button
                className="btn small"
                type="button"
                onClick={e => { e.stopPropagation(); setSelected(service); }}
              >
                Xem chi tiết
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>

    {selected && (
      <div className="service-modal-backdrop" onClick={() => setSelected(null)}>
        <div className="service-modal" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Đóng">×</button>
          <img className="service-modal-image" src={selected.image} alt={selected.name} />
          <div className="service-modal-content">
          
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <div className="service-modal-meta">
              <span>⏱ {selected.duration} phút</span>
              <strong>{Number(selected.price || 0).toLocaleString("vi-VN")}đ</strong>
            </div>
            <h3>Các hạng mục bên trong</h3>
            <div className="sub-service-detail-grid">
              {(selected.subServices || []).map((sub, i) => (
                <div className="sub-service-detail" key={i}>
                  <span>✓</span>
                  <strong>{typeof sub === "string" ? sub : sub.name}</strong>
                </div>
              ))}
            </div>
            <button className="btn" onClick={() => navigate("/booking?service=" + selected.id)}>
              Đặt lịch {selected.name}
            </button>
          </div>
        </div>
      </div>
    )}
  </>;
}
