import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { initialServices } from "../data";

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState(initialServices);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/services").then(r => {
      const active = Array.isArray(r.data)
        ? r.data.filter(s => s.active !== false)
        : [];
      if (active.length) setServices(active);
    }).catch(() => {});
  }, []);

  return (
    <main className="container page services-page">
      <div className="services-heading">
        <div>
          <span className="eyebrow">DỊCH VỤ</span>
          <h1>4 dịch vụ chính</h1>
          <p>Chọn một dịch vụ chính để xem các hạng mục chăm sóc bên trong.</p>
        </div>
      </div>

      <div className="service-main-grid">
        {services.slice(0, 4).map((s, index) => (
          <article
            className="main-service-card clickable-service"
            key={s._id || s.id}
            onClick={() => setSelected(s)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setSelected(s)}
          >
            <div className="main-service-image">
              <img src={s.image || "/images/services/dich-vu-4-nhom-3d.jpg"} alt={s.name} />
              <span className="service-badge">0{index + 1}</span>
            </div>
            <div className="main-service-body">
              <span className="service-number">DỊCH VỤ CHÍNH</span>
              <h2>{s.name}</h2>
              <p>{s.description}</p>
              <div className="service-meta">
                <span>{s.duration} phút</span>
                <b>{Number(s.price || 0).toLocaleString("vi-VN")}đ</b>
              </div>
              <button
                type="button"
                className="btn small"
                onClick={e => {
                  e.stopPropagation();
                  setSelected(s);
                }}
              >
                Xem dịch vụ bên trong
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="service-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="service-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Đóng">×</button>
            <img
              className="service-modal-image"
              src={selected.image || "/images/services/dich-vu-4-nhom-3d.jpg"}
              alt={selected.name}
            />
            <div className="service-modal-content">
              <span className="service-number">DỊCH VỤ CHÍNH</span>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>

              <div className="service-modal-meta">
                <span>⏱ {selected.duration} phút</span>
                <strong>{Number(selected.price || 0).toLocaleString("vi-VN")}đ</strong>
              </div>

              <h3>Các hạng mục trong {selected.name}</h3>
              <div className="sub-service-detail-grid">
                {(selected.subServices || []).map((sub, i) => (
                  <div className="sub-service-detail" key={i}>
                    <span>✓</span>
                    <div>
                      <strong>{typeof sub === "string" ? sub : sub.name}</strong>
                      {typeof sub !== "string" && sub.description && <small>{sub.description}</small>}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn"
                onClick={() => navigate(`/booking?service=${selected._id || selected.id}`)}
              >
                Đặt lịch {selected.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
