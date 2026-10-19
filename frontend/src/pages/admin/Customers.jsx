import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api";

const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
};

const FILTER_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const getServices = (booking) => {
    if (booking.services?.length) {
        return booking.services.filter(Boolean);
    }

    return booking.service ? [booking.service] : [];
};

const calculateTotal = (booking) => {
    const servicesTotal = getServices(booking).reduce(
        (sum, service) => sum + Number(service.price || 0),
        0
    );

    const subServicesTotal = (
        booking.selectedSubServices || []
    ).reduce(
        (sum, service) => sum + Number(service.price || 0),
        0
    );

    return servicesTotal + subServicesTotal;
};

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filter, setFilter] = useState("pending");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState("");

    // Tải danh sách lịch hẹn và nhân viên
    const loadData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);

        try {
            const [bookingResponse, employeeResponse] =
                await Promise.all([
                    api.get("/appointments/admin/all"),
                    api.get("/employees"),
                ]);

            setBookings(
                Array.isArray(bookingResponse.data)
                    ? bookingResponse.data
                    : []
            );

            setEmployees(
                Array.isArray(employeeResponse.data)
                    ? employeeResponse.data
                    : []
            );

            setMessage("");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Unable to load dữ liệu lịch hẹn."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(true);

        const timer = setInterval(() => {
            loadData(false);
        }, 5000);

        return () => clearInterval(timer);
    }, [loadData]);

    // Đếm số đơn theo từng trạng thái
    const counts = useMemo(() => {
        const result = {
            all: bookings.length,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        };

        bookings.forEach((booking) => {
            if (Object.hasOwn(result, booking.status)) {
                result[booking.status]++;
            }
        });

        return result;
    }, [bookings]);

    // Lọc danh sách đơn hàng
    const filteredBookings = useMemo(() => {
        if (filter === "all") return bookings;

        return bookings.filter(
            (booking) => booking.status === filter
        );
    }, [bookings, filter]);

    // Phân công nhân viên
    const handleAssignEmployee = async (bookingId, employeeId) => {
        if (!employeeId) {
            setMessage("Please select a staff member to assign.");
            return;
        }

        try {
            setProcessingId(bookingId);

            await api.put(`/appointments/${bookingId}/assign`, {
                employee: employeeId,
            });

            await loadData();
            setMessage("Staff assigned successfully.");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Unable to assign staff."
            );
        } finally {
            setProcessingId("");
        }
    };

    // Cập nhật trạng thái đơn hàng
    const handleChangeStatus = async (bookingId, newStatus) => {
        const booking = bookings.find(
            (item) => item._id === bookingId
        );

        if (!booking || booking.status === newStatus) return;

        let cancellationReason = "";

        if (newStatus === "cancelled") {
            const reason = window.prompt(
                "Enter a cancellation reason (optional):",
                ""
            );

            // Nhấn Cancel trong hộp thoại thì không hủy đơn
            if (reason === null) return;

            cancellationReason = reason.trim();
        }

        const actionLabels = {
            pending: "mở lại",
            confirmed: "xác nhận",
            completed: "hoàn thành",
            cancelled: "hủy",
        };

        const confirmed = window.confirm(
            `Are you sure you want to ${actionLabels[newStatus]} this order?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(bookingId);

            await api.put(`/appointments/${bookingId}/status`, {
                status: newStatus,
                cancellationReason,
            });

            await loadData();

            setMessage(
                newStatus === "cancelled"
                    ? "Cancelled đơn thành công."
                    : "Order status updated successfully."
            );
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Unable to update order status."
            );
        } finally {
            setProcessingId("");
        }
    };

    return (
        <main className="container page admin-bookings-page">
            {/* Tiêu đề trang */}
            <div className="page-title-row">
                <div>
                    <span className="section-kicker">
                        QUẢN LÝ ĐẶT LỊCH
                    </span>

                    <h1>Quản lý đơn / lịch hẹn</h1>

                    <p className="muted">
                        Theo dõi lịch hẹn, phân công nhân viên,
                        quản lý đơn hủy và cập nhật trạng thái.
                    </p>
                </div>

                <button
                    type="button"
                    className="outline-btn"
                    onClick={() => loadData(true)}
                    disabled={loading}
                >
                    ↻ {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {/* Thông báo */}
            {message && (
                <div
                    className="booking-message"
                    role="status"
                >
                    <span>{message}</span>

                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Đóng thông báo"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Thống kê */}
            <div className="booking-stats">
                <div className="booking-stat">
                    <span>Tổng số đơn</span>
                    <strong>{counts.all}</strong>
                </div>

                <div className="booking-stat">
                    <span>Pending</span>
                    <strong>{counts.pending}</strong>
                </div>

                <div className="booking-stat">
                    <span>Confirmed</span>
                    <strong>{counts.confirmed}</strong>
                </div>

                <div className="booking-stat">
                    <span>Completed</span>
                    <strong>{counts.completed}</strong>
                </div>

                <div className="booking-stat">
                    <span>Cancelled</span>
                    <strong>{counts.cancelled}</strong>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="booking-filters">
                {FILTER_OPTIONS.map((option) => (
                    <button
                        type="button"
                        key={option.value}
                        className={
                            filter === option.value ? "active" : ""
                        }
                        onClick={() => setFilter(option.value)}
                    >
                        {option.label}
                        <b>{counts[option.value]}</b>
                    </button>
                ))}
            </div>

            {/* Bảng lịch hẹn */}
            <div className="tablewrap">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Dịch vụ</th>
                            <th>Date / giờ</th>
                            <th>Nhân viên</th>
                            <th>Price trị</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && bookings.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty">
                                    Loading data...
                                </td>
                            </tr>
                        ) : filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => {
                                const services = getServices(booking);
                                const isProcessing =
                                    processingId === booking._id;

                                return (
                                    <tr key={booking._id}>
                                        {/* Thông tin khách hàng */}
                                        <td>
                                            <strong>
                                                {booking.customer?.name ||
                                                    booking.customerName ||
                                                    "Customer"}
                                            </strong>

                                            <br />

                                            <small>
                                                {booking.customerPhone ||
                                                    booking.customer?.phone ||
                                                    "Chưa có số điện thoại"}
                                            </small>
                                        </td>

                                        {/* Danh sách dịch vụ */}
                                        <td>
                                            {services.length > 0
                                                ? services
                                                      .map(
                                                          (service) =>
                                                              service.name
                                                      )
                                                      .join(" + ")
                                                : "Chưa có dịch vụ"}

                                            {booking.selectedSubServices
                                                ?.length > 0 && (
                                                <small className="sub-services">
                                                    <br />
                                                    Dịch vụ bổ sung:{" "}
                                                    {booking.selectedSubServices
                                                        .map(
                                                            (service) =>
                                                                service.name
                                                        )
                                                        .join(", ")}
                                                </small>
                                            )}
                                        </td>

                                        {/* Duration */}
                                        <td>
                                            <strong>
                                                {booking.date || "—"}
                                            </strong>

                                            <br />

                                            <small>
                                                {booking.time || "—"}
                                            </small>
                                        </td>

                                        {/* Phân công nhân viên */}
                                        <td>
                                            <select
                                                aria-label="Phân công nhân viên"
                                                value={
                                                    booking.employee?._id ||
                                                    booking.employee ||
                                                    ""
                                                }
                                                onChange={(event) =>
                                                    handleAssignEmployee(
                                                        booking._id,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    booking.status ===
                                                        "cancelled" ||
                                                    isProcessing
                                                }
                                            >
                                                <option value="">
                                                    -- Chọn nhân viên --
                                                </option>

                                                {employees.map((employee) => (
                                                    <option
                                                        key={employee._id}
                                                        value={employee._id}
                                                    >
                                                        {employee.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Total */}
                                        <td>
                                            <strong className="booking-total">
                                                {formatMoney(
                                                    calculateTotal(booking)
                                                )}
                                            </strong>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <select
                                                aria-label="Status đơn"
                                                className={`status-select status-${booking.status}`}
                                                value={booking.status}
                                                onChange={(event) =>
                                                    handleChangeStatus(
                                                        booking._id,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={isProcessing}
                                            >
                                                {Object.entries(
                                                    STATUS_LABELS
                                                ).map(([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>

                                            {booking.status ===
                                                "cancelled" && (
                                                <small className="cancel-note">
                                                    Lý do:{" "}
                                                    {booking.cancellationReason ||
                                                        "Không ghi lý do"}
                                                </small>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            {booking.status !== "cancelled" &&
                                            booking.status !== "completed" ? (
                                                <button
                                                    type="button"
                                                    className="danger"
                                                    disabled={isProcessing}
                                                    onClick={() =>
                                                        handleChangeStatus(
                                                            booking._id,
                                                            "cancelled"
                                                        )
                                                    }
                                                >
                                                    Cancel đơn
                                                </button>
                                            ) : booking.status ===
                                              "cancelled" ? (
                                                <button
                                                    type="button"
                                                    className="outline-btn small-btn"
                                                    disabled={isProcessing}
                                                    onClick={() =>
                                                        handleChangeStatus(
                                                            booking._id,
                                                            "pending"
                                                        )
                                                    }
                                                >
                                                    Mở lại đơn
                                                </button>
                                            ) : (
                                                <span className="muted">
                                                    Đã hoàn thành
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="table-empty"
                                >
                                    Không có đơn đặt lịch phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="booking-footer muted">
                Danh sách tự động cập nhật sau mỗi 5 giây.
            </p>
        </main>
    );
}