import { useAuth } from "../context/AuthContext";


export default function Profile() {

  // Lấy thông tin người dùng đang đăng nhập
  const { user } = useAuth();


  return (
    <main className="container page">

      <div className="formbox">

        {/* Tiêu đề */}
        <h1>
          Thông tin tài khoản
        </h1>


        <div className="profile">

          {/* Avatar - lấy chữ cái đầu của tên */}
          <div className="avatar">
            {user.name[0]}
          </div>


          {/* Họ tên */}
          <p>
            <b>Họ tên:</b>{" "}
            {user.name}
          </p>


          {/* Email */}
          <p>
            <b>Email:</b>{" "}
            {user.email}
          </p>


          {/* Vai trò */}
          <p>
            <b>Vai trò:</b>{" "}
            {user.role}
          </p>

        </div>

      </div>

    </main>
  );
}
