import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api";

const money = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const getServiceList = (appointment) => {
  if (appointment.services?.length) {
    return appointment.services;
  }

  return appointment.service ? [appointment.service] : [];
};

const getAppointmentTotal = (appointment) => {
  const serviceTotal = getServiceList(appointment).reduce(
    (total, service) => total + Number(service.price || 0),
    0
  );

  const subServiceTotal = (appointment.selectedSubServices || []).reduce(
    (total, service) => total + Number(service.price || 0),
    0
  );

  return serviceTotal + subServiceTotal;
};

const getStatusLabel = (status) => {
  const statuses = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return statuses[status] || status || "Không xác định";
};

export default function Customers() {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Tải danh sách khách hàng
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/customers");

      setList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load danh sách khách hàng."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Search theo tên, email hoặc số điện thoại
  const filteredCustomers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return list;

    return list.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [list, query]);

  // View Details khách hàng
  const showDetail = async (customerId) => {
    setDetailLoading(true);
    setMessage("");

    try {
      const response = await api.get(`/customers/${customerId}`);
      setDetail(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load thông tin doanh số khách hàng."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
  };

  return (
    <main className="container page customers-page">
      {/* Tiêu đề */}
      <div className="page-title-row">
        <div>
          <span className="section-kicker">CRM</span>
          <h1>Customer Management</h1>
          <p className="muted">
            Theo dõi thông tin, lịch đặt, doanh thu và lịch sử
            sử dụng dịch vụ của khách hàng.
          </p>
        </div>

        <button
          type="button"
          className="outline-btn"
          onClick={loadCustomers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Thông báo lỗi */}
      {message && (
        <div className="error" role="alert">
          {message}
        </div>
      )}

      {/* Search */}
      <div className="customer-toolbar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, or phone..."
          aria-label="Search khách hàng"
        />

        <strong>
          {filteredCustomers.length} khách hàng
        </strong>
      </div>

      {/* Danh sách khách hàng */}
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Information</th>
              <th>Lịch đặt</th>
              <th>Completed Revenue</th>
              <th>Cancelled Orders</th>
              <th>Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && list.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  Đang tải danh sách khách hàng...
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <strong>
                      {customer.name || "Customer"}
                    </strong>
                  </td>

                  <td>
                    <div>{customer.phone || "Chưa có số điện thoại"}</div>
                    <small>{customer.email || "Chưa có email"}</small>
                  </td>

                  <td>{customer.bookingCount ?? 0}</td>

                  <td>
                    <strong>{money(customer.spent)}</strong>
                  </td>

                  <td>{customer.cancelledCount ?? 0}</td>

                  <td>{customer.reviewCount ?? 0} lượt</td>

                  <td>
                    <button
                      type="button"
                      className="outline-btn small-btn"
                      onClick={() => showDetail(customer._id)}
                      disabled={detailLoading}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="table-empty">
                  {query
                    ? "No results found khách hàng phù hợp."
                    : "No customers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details khách hàng */}
      {detail && (
        <div
          className="detail-overlay"
          onClick={closeDetail}
        >
          <section
            className="customer-detail panel-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="page-title-row">
              <div>
                <span className="section-kicker">
                  CHI TIẾT KHÁCH HÀNG
                </span>

                <h2 id="customer-detail-title">
                  {detail.customer?.name || "Customer"}
                </h2>

                <p className="muted">
                  {detail.customer?.phone || "Chưa có số điện thoại"}
                  {" · "}
                  {detail.customer?.email || "Chưa có email"}
                </p>
              </div>

              <button
                type="button"
                className="outline-btn"
                onClick={closeDetail}
              >
                Đóng
              </button>
            </div>

            {detailLoading ? (
              <p>Đang tải thông tin khách hàng...</p>
            ) : (
              <>
                {/* Thống kê */}
                <div className="analytics-grid compact">
                  <div className="summary-card">
                    <span>Completed Revenue</span>
                    <strong>
                      {money(detail.stats?.revenue)}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Price trị đơn chưa hủy</span>
                    <strong>
                      {money(detail.stats?.bookedValue)}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Đơn hoàn thành</span>
                    <strong>
                      {detail.stats?.completedCount ?? 0}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Cancelled Orders</span>
                    <strong>
                      {detail.stats?.cancelledCount ?? 0}
                    </strong>
                  </div>
                </div>

                {/* Lịch sử đặt lịch */}
                <h3>Lịch sử đặt lịch</h3>

                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date giờ</th>
                        <th>Dịch vụ</th>
                        <th>Nhân viên</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Lý do hủy</th>
                      </tr>
                    </thead>

                    <tbody>
                      {detail.appointments?.length > 0 ? (
                        detail.appointments.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              {appointment.date || "—"}
                              <br />
                              <small>
                                {appointment.time || ""}
                              </small>
                            </td>

                            <td>
                              {getServiceList(appointment)
                                .map((service) => service.name)
                                .filter(Boolean)
                                .concat(
                                  (appointment.selectedSubServices || [])
                                    .map((service) => service.name)
                                    .filter(Boolean)
                                )
                                .join(" + ") || "—"}
                            </td>

                            <td>
                              {appointment.employee?.name || "—"}
                            </td>

                            <td>
                              <strong>
                                {money(getAppointmentTotal(appointment))}
                              </strong>
                            </td>

                            <td>
                              <span
                                className={`status ${appointment.status || ""}`}
                              >
                                {getStatusLabel(appointment.status)}
                              </span>
                            </td>

                            <td>
                              {appointment.cancellationReason || "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="table-empty">
                            Customer chưa có lịch đặt nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Status tải chi tiết */}
      {detailLoading && (
        <div className="loading-toast">
          Đang tải thông tin khách hàng...
        </div>
      )}
    </main>
  );
}