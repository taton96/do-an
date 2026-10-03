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
            <Link className={active("/")} to="/">
              <span className="nav-icon">⌂</span>
              Trang chủ
            </Link>

            <Link className={active("/services")} to="/services">
              <span className="nav-icon">✦</span>
              Dịch vụ
            </Link>

            {user?.role === "customer" && (
              <>
                <Link className={active("/booking")} to="/booking">
                  <span className="nav-icon">＋</span>
                  Đặt lịch
                </Link>
                <Link className={active("/my-bookings")} to="/my-bookings">
                  <span className="nav-icon">◷</span>
                  Lịch của tôi
                </Link>
              </>
            )}

            {user?.role === "staff" && (
              <Link className={active("/staff")} to="/staff">
                <span className="nav-icon">◫</span>
                Nhân viên
              </Link>
            )}

            {user?.role === "admin" && (
              <Link className={active("/admin")} to="/admin">
                <span className="nav-icon">⚙</span>
                Quản trị
              </Link>
            )}
          </nav>

          <div className="premium-account">
            {!user ? (
              <>
                <Link className="premium-login" to="/login">
                  Đăng nhập
                </Link>
                <Link className="premium-register" to="/register">
                  Đăng ký
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
                        : user.role === "staff"
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

      <footer>
        <b>BOOKING SERVICE</b>
        <p>Đặt lịch nhanh chóng - Tiện lợi - Chuyên nghiệp</p>
        <p>Hotline: 0123 456 789</p>
      </footer>
    </>
  );
}
