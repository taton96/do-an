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
              <small>COMPLETE CARE</small>
            </span>
          </Link>

          <nav className="premium-nav">
            <Link className={active("/")} to="/">Home</Link>
            <Link className={active("/about")} to="/about">About Us</Link>
            <Link className={active("/booking")} to="/booking">Book Now</Link>
            {user?.role === "customer" && (
              <Link className={active("/my-bookings")} to="/my-bookings">My Bookings</Link>
            )}
            {user?.role === "employee" && (
              <Link className={active("/staff")} to="/staff">Staff</Link>
            )}
            {user?.role === "admin" && (
              <Link className={active("/admin")} to="/admin">Admin</Link>
            )}
          </nav>

          <div className="premium-account">
            {!user ? (
              <>
                <Link className="premium-login" to="/login">
                  Sign In
                </Link>

              </>
            ) : (
              <>
                <Link className="premium-profile" to="/profile">
                  <span className="premium-avatar">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="premium-user-info">
                    <strong>{user.name || "Account"}</strong>
                    <small>
                      {user.role === "admin"
                        ? "Admin viên"
                        : user.role === "employee"
                        ? "Staff"
                        : "Customer"}
                    </small>
                  </span>
                </Link>

                <button
                  type="button"
                  className="premium-logout"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
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
                <small>COMPLETE CARE</small>
              </div>
            </div>
            <p className="footer-slogan">
              Book Now chăm sóc dễ dàng - Thư giãn trọn vẹn - Phục vụ chuyên nghiệp
            </p>
          </div>

          <div className="footer-column">
            <h4>ABOUT US</h4>
            <Link to="/">About Us</Link>
            <Link to="/booking">Our Services</Link>
            <Link to="/booking">Our Team</Link>
            <Link to="/profile">Account khách hàng</Link>
          </div>

          <div className="footer-column">
            <h4>SERVICES</h4>
            <Link to="/booking/cat-toc">Haircut</Link>
            <Link to="/booking/massage">Massage</Link>
            <Link to="/booking/cham-soc-da">Skincare</Link>
            <Link to="/booking/cham-soc-suc-khoe">Wellness</Link>
          </div>

          <div className="footer-column">
            <h4>SUPPORT</h4>
            <Link to="/booking">Booking Guide</Link>
            <Link to="/booking">Choose a Service & Staff</Link>
            <Link to="/booking">Payment</Link>
            <Link to="/">Booking Policy</Link>
          </div>

          <div className="footer-column footer-contact">
            <h4>CONTACT</h4>
            <p><span>☎</span> Hotline: <strong>0123 456 789</strong></p>
            <p><span>✉</span> Email: support@booking.vn</p>
            <p><span>⌖</span> Hours: 08:00 - 20:30</p>
            <p><span>⌂</span> Open Monday - Sunday</p>
          </div>
        </div>

        <div className="footer-payment">
          <div>
            <h4>PAYMENT METHODS</h4>
            <p>Payment tại cửa hàng hoặc quét mã QR khi đặt lịch</p>
          </div>
          <div className="payment-list">
            <span>💵 Cash</span>
            <span>▣ QR Code</span>
            <span>💳 Bank Transfer</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 BOOKING+ • Complete Care</span>
          <div>
            <Link to="/">Terms of Service</Link>
            <Link to="/">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
