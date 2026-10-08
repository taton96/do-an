import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const roleLabel =
    user?.role === "customer"
      ? "Khách hàng"
      : user?.role === "employee" || user?.role === "staff"
      ? "Nhân viên"
      : user?.role === "admin"
      ? "Quản trị viên"
      : user?.role || "Thành viên";

  const handleNameChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const value = name.trim();
    if (!value) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    try {
      const { data } = await api.patch("/auth/profile", { name: value });
      updateUser(data.user);
      setMessage("Đã cập nhật họ và tên.");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể cập nhật thông tin lúc này.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin đổi mật khẩu.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const { data } = await api.patch("/auth/change-password", {
        currentPassword, newPassword
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(data.message || "Đổi mật khẩu thành công.");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đổi mật khẩu lúc này.");
    }
  };

  return (
    <main className="container page profile-page">
      <div className="profile-page-heading">
        <div>
          <h2>TÀI KHOẢN CỦA TÔI</h2>
          <h2>Hồ sơ khách hàng</h2>
          <p>Quản lý thông tin tài khoản và bảo mật của bạn.</p>
        </div>
        <div className="profile-heading-badge">✓ Tài khoản đang hoạt động</div>
      </div>

      {user?.role === "customer" && (
        <div className="profile-message success" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span>📅 Bạn muốn xem lịch đã đặt và lịch đã xác nhận?</span>
          <a href="/my-bookings" className="profile-primary-btn" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>Xem lịch của tôi</a>
        </div>
      )}

      <div className="profile-layout">
        {/* Bên trái: thông tin tài khoản */}
        <section className="profile-panel account-panel">
          <div className="profile-panel-head">
            <div className="profile-panel-icon">👤</div>
            <div>
              <h2>Thông tin tài khoản</h2>
              <p>Thông tin hiện tại của khách hàng</p>
            </div>
          </div>

          <div className="profile-user-card">
            <div className="profile-avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h3>{user?.name || "Người dùng"}</h3>
              <span>{roleLabel}</span>
            </div>
          </div>

          <div className="account-info-list">
            <div className="account-info-item">
              <span className="account-info-icon">👤</span>
              <div>
                <small>Họ và tên</small>
                <strong>{user?.name || "Chưa cập nhật"}</strong>
              </div>
            </div>

            <div className="account-info-item">
              <span className="account-info-icon">✉️</span>
              <div>
                <small>Email</small>
                <strong>{user?.email || "Chưa cập nhật"}</strong>
              </div>
            </div>

            <div className="account-info-item">
              <span className="account-info-icon">🛡️</span>
              <div>
                <small>Vai trò</small>
                <strong>{roleLabel}</strong>
              </div>
            </div>

            <div className="account-info-item">
              <span className="account-info-icon">✓</span>
              <div>
                <small>Trạng thái</small>
                <strong className="account-active">Đang hoạt động</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Bên phải: đổi tên + mật khẩu */}
        <section className="profile-panel settings-panel">
          <div className="profile-panel-head">
            <div className="profile-panel-icon">⚙️</div>
            <div>
              <h2>Chỉnh sửa tài khoản</h2>
              <p>Đổi tên khách hàng và mật khẩu</p>
            </div>
          </div>

          {message && <div className="profile-message success">{message}</div>}
          {error && <div className="profile-message error">{error}</div>}

          <form className="profile-form" onSubmit={handleNameChange}>
            <div className="profile-section-label">
              <span>01</span>
              <div>
                <h3>Đổi tên khách hàng</h3>
                <p>Cập nhật tên hiển thị trên tài khoản.</p>
              </div>
            </div>

            <label>
              Tên khách hàng
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên khách hàng"
              />
            </label>

            <button className="profile-primary-btn" type="submit">
              Lưu tên khách hàng
            </button>
          </form>

          <div className="profile-divider" />

          <form className="profile-form" onSubmit={handlePasswordChange}>
            <div className="profile-section-label">
              <span>02</span>
              <div>
                <h3>Đổi mật khẩu</h3>
                <p>Sử dụng mật khẩu mới có ít nhất 6 ký tự.</p>
              </div>
            </div>

            <label>
              Mật khẩu hiện tại
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </label>

            <label>
              Mật khẩu mới
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </label>

            <label>
              Xác nhận mật khẩu mới
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </label>

            <button className="profile-primary-btn" type="submit">
              Đổi mật khẩu
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
