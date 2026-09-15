import { useState } from "react";
import { Link } from "react-router-dom";
import {
  initialServices,
  getData
} from "../data";


export default function Services() {

  // Ô tìm kiếm
  const [search, setSearch] = useState("");


  // Lấy danh sách dịch vụ
  const services = getData(
    "services",
    initialServices
  );


  // Lọc dịch vụ đang hoạt động và tìm kiếm theo tên
  const filteredServices = services.filter(
    (service) =>
      service.status === "active" &&
      service.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );


  return (
    <main className="container page">

      {/* Tiêu đề và tìm kiếm */}
      <div className="section-title">

        <h1>
          Dịch vụ
        </h1>

        <input
          className="search"
          type="text"
          placeholder="Tìm dịch vụ..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

      </div>


      {/* Danh sách dịch vụ */}
      <div className="grid">

        {filteredServices.map((service) => (

          <div
            className="card"
            key={service.id}
          >

            {/* Icon */}
            <div className="icon">
              ★
            </div>


            {/* Tên dịch vụ */}
            <h2>
              {service.name}
            </h2>


            {/* Mô tả */}
            <p>
              {service.description}
            </p>


            {/* Thời gian và giá */}
            <div className="row">

              <span>
                {service.duration} phút
              </span>

              <b>
                {service.price.toLocaleString("vi-VN")}đ
              </b>

            </div>


            {/* Đặt lịch */}
            <Link
              to="/booking"
              className="btn small"
            >
              Đặt lịch
            </Link>

          </div>

        ))}

      </div>

    </main>
  );
}
