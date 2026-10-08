import { useNavigate } from "react-router-dom";
import { initialServices } from "../data";

const slugs = { "Cắt tóc": "cat-toc", "Massage": "massage", "Chăm sóc da": "cham-soc-da", "Chăm sóc sức khỏe": "cham-soc-suc-khoe" };

export default function Services() {
  const navigate = useNavigate();
  return (
    <main className="container page services-page">
      <div className="services-page-head">
        <span>DỊCH VỤ</span>
        <h1>4 dịch vụ chính</h1>
        <p>Chọn một dịch vụ để chuyển thẳng sang trang đặt lịch riêng.</p>
      </div>
      <div className="services-main-grid">
        {initialServices.slice(0, 4).map((service) => (
          <article className="services-main-card" key={service.id}>
            <img src={service.image} alt={service.name} />
            <div>
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <strong>Từ {Number(service.price || 0).toLocaleString("vi-VN")}đ</strong>
              <button className="btn" onClick={() => navigate(`/booking/${slugs[service.name]}`)}>Đặt lịch</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
