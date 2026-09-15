import { Link } from "react-router-dom";
// Import dữ liệu dịch vụ ban đầu
import { initialServices } from "../data";


// Component trang chủ
export default function Home() {

  return (
    <>
      {/* =====================================================
          PHẦN 1: HERO - KHU VỰC GIỚI THIỆU CHÍNH
          ===================================================== */}
      <section className="hero">
        <div>

          {/* Nhãn nhỏ phía trên tiêu đề */}
          <span className="badge">
            ĐẶT LỊCH ONLINE
          </span>

          {/* Tiêu đề chính */}
          <h1>
            ĐẶT LỊCH DỊCH VỤ
          </h1>

          {/* Mô tả */}
          <p>
            Nhanh chóng - Tiện lợi - Chuyên nghiệp
          </p>

          {/* 
            Link chuyển người dùng đến trang Booking
            Khi bấm "Đặt lịch ngay" → /booking
          */}
          <Link to="/booking" className="btn">
            Đặt lịch ngay
          </Link>

        </div>
      </section>


      {/* =====================================================
          PHẦN 2: DANH SÁCH DỊCH VỤ NỔI BẬT
          ===================================================== */}
      <section className="container">

        {/* Tiêu đề phần dịch vụ */}
        <div className="section-title">

          <h2>
            Dịch vụ nổi bật
          </h2>

          {/* 
            Khi bấm "Xem tất cả"
            → chuyển đến trang /services
          */}
          <Link to="/services">
            Xem tất cả →
          </Link>

        </div>


        {/* ===================================================
            HIỂN THỊ DANH SÁCH DỊCH VỤ
            =================================================== */}

        <div className="grid">

          {/*
            initialServices là mảng chứa các dịch vụ.

            slice(0, 3)
            → chỉ lấy 3 dịch vụ đầu tiên.

            map()
            → duyệt từng dịch vụ và tạo ra một card.
          */}

          {initialServices.slice(0, 3).map((service) => (

            <div
              className="card"
              key={service.id}
            >

              {/* Icon của dịch vụ */}
              <div className="icon">
                ✂
              </div>


              {/* Tên dịch vụ */}
              <h3>
                {service.name}
              </h3>


              {/* Mô tả dịch vụ */}
              <p>
                {service.description}
              </p>


              {/* Giá dịch vụ */}
              <b>
                {service.price.toLocaleString("vi-VN")}đ
              </b>


              {/* Thời gian thực hiện */}
              <small>
                {service.duration} phút
              </small>


              {/* 
                Nút đặt lịch.
                Khi bấm → chuyển sang /booking
              */}
              <Link
                className="btn small"
                to="/booking"
              >
                Đặt lịch
              </Link>

            </div>

          ))}

        </div>
      </section>
    </>
  );
}
