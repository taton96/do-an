
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  // Lấy thông tin người dùng đang đăng nhập
  const { user } = useAuth();

  return (
    <main className="container page">
      <div className="formbox profile-box">

        <div className="profile-heading">
          <h1>Thông tin tài khoản</h1>
          <p>Thông tin cá nhân của bạn</p>
        </div>

        <div className="profile">

          {/* Avatar */}
          <div className="avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Tên */}
          <div className="profile-name">
            <h2>{user?.name || "Người dùng"}</h2>
            <h3>Thành viên</h3>
          </div>

          {/* Thông tin */}
          <div className="profile-info">

            <div className="profile-item">
              <div className="profile-icon">👤</div>
              <div>
                <h2>Họ và tên</h2>
                <strong>{user?.name || "Chưa cập nhật"}</strong>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-icon">✉️</div>
              <div>
                <h2>Email</h2>
                <h2>{user?.email || "Chưa cập nhật"}</h2>
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-icon">🛡️</div>
              <div>
                <h2>Vai trò</h2>
                <h3>
                  {user?.role === "customer"
                    ? "Khách hàng"
                    : user?.role === "staff"
                    ? "Nhân viên"
                    : user?.role === "admin"
                    ? "Quản trị viên"
                    : user?.role}
                </h3>
              </div>
            </div>

          </div>

          {/* Trạng thái */}
          <div className="profile-status">
            <span></span>
            Tài khoản đang hoạt động
          </div>

        </div>
      </div>
    </main>
  );
}


