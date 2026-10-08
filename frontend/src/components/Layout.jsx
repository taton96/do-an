import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const active = (path) =>
    location.pathname === path ? "premium-nav-link active" : "premium-nav-link";

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <>
      <header className="premium-header">
        <div className="premium-header-inner">
          <Link className="premium-logo" to="/">
            <span className="premium-logo-mark">✦</span>
            <span className="premium-logo-text">
              <strong>BOOKING<span>+</span></strong>
              <small>CHĂM SÓC TOÀN DIỆN</small>
            </span>
          </Link>

          <nav className="premium-nav">
            <Link className={active("/")} to="/">Trang chủ</Link>
            {user?.role === "customer" && (
              <Link className={active("/my-bookings")} to="/my-bookings">Lịch của tôi</Link>
            )}
            {user?.role === "employee" && (
              <Link className={active("/staff")} to="/staff">Nhân viên</Link>
            )}
            {user?.role === "admin" && (
              <Link className={active("/admin")} to="/admin">Quản trị</Link>
            )}
          </nav>

          <div className="premium-account">
            {!user ? (
              <>
                <Link className="premium-login" to="/login">
                  Đăng nhập
                </Link>

              </>
            ) : (
              <>
                <Link className="premium-profile" to="/profile">
                  <span className="premium-avatar">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="premium-user-info">
                    <strong>{user.name || "Tài khoản"}</strong>
                    <small>
                      {user.role === "admin"
                        ? "Quản trị viên"
                        : user.role === "employee"
                        ? "Nhân viên"
                        : "Khách hàng"}
                    </small>
                  </span>
                </Link>

                <button
                  type="button"
                  className="premium-logout"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  ⇥
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="site-footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark">✦</span>
              <div>
                <strong>BOOKING<span>+</span></strong>
                <small>CHĂM SÓC TOÀN DIỆN</small>
              </div>
            </div>
            <p className="footer-slogan">
              Đặt lịch chăm sóc dễ dàng - Thư giãn trọn vẹn - Phục vụ chuyên nghiệp
            </p>
          </div>

          <div className="footer-column">
            <h4>VỀ CHÚNG TÔI</h4>
            <Link to="/">Giới thiệu</Link>
            <Link to="/booking">Dịch vụ của chúng tôi</Link>
            <Link to="/booking">Đội ngũ nhân viên</Link>
            <Link to="/profile">Tài khoản khách hàng</Link>
          </div>

          <div className="footer-column">
            <h4>DỊCH VỤ</h4>
            <Link to="/booking/cat-toc">Cắt tóc</Link>
            <Link to="/booking/massage">Massage</Link>
            <Link to="/booking/cham-soc-da">Chăm sóc da</Link>
            <Link to="/booking/cham-soc-suc-khoe">Chăm sóc sức khỏe</Link>
          </div>

          <div className="footer-column">
            <h4>HỖ TRỢ</h4>
            <Link to="/booking">Hướng dẫn đặt lịch</Link>
            <Link to="/booking">Chọn dịch vụ & nhân viên</Link>
            <Link to="/booking">Thanh toán</Link>
            <Link to="/">Chính sách đặt lịch</Link>
          </div>

          <div className="footer-column footer-contact">
            <h4>LIÊN HỆ</h4>
            <p><span>☎</span> Hotline: <strong>0123 456 789</strong></p>
            <p><span>✉</span> Email: support@booking.vn</p>
            <p><span>⌖</span> Thời gian: 08:00 - 20:30</p>
            <p><span>⌂</span> Phục vụ từ Thứ 2 - Chủ Nhật</p>
          </div>
        </div>

        <div className="footer-payment">
          <div>
            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
            <p>Thanh toán tại cửa hàng hoặc quét mã QR khi đặt lịch</p>
          </div>
          <div className="payment-list">
            <span>💵 Tiền mặt</span>
            <span>▣ QR Code</span>
            <span>💳 Chuyển khoản</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 BOOKING+ • Chăm sóc toàn diện</span>
          <div>
            <Link to="/">Điều khoản sử dụng</Link>
            <Link to="/">Chính sách bảo mật</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
