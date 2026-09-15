import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Register() {

  // Lấy hàm đăng ký từ AuthContext
  const { register } = useAuth();

  // Dùng để chuyển trang
  const navigate = useNavigate();


  // Dữ liệu form đăng ký
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });


  // Thông báo lỗi
  const [error, setError] = useState("");


  // Xử lý đăng ký
  function submit(event) {

    event.preventDefault();

    try {

      // Gọi hàm đăng ký
      register(form);

      // Đăng ký thành công → về trang chủ
      navigate("/");

    } catch (error) {

      // Hiển thị lỗi
      setError(error.message);
    }
  }


  return (
    <main className="auth">

      <div className="formbox">

        {/* Tiêu đề */}
        <h1>
          Đăng ký
        </h1>


        {/* Thông báo lỗi */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* Form đăng ký */}
        <form onSubmit={submit}>

          {/* Họ tên */}
          <label>
            Họ tên

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value
                })
              }
              required
            />
          </label>


          {/* Email */}
          <label>
            Email

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value
                })
              }
              required
            />
          </label>


          {/* Mật khẩu */}
          <label>
            Mật khẩu

            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value
                })
              }
              required
            />
          </label>


          {/* Nút đăng ký */}
          <button
            type="submit"
            className="btn"
          >
            Tạo tài khoản
          </button>

        </form>

      </div>

    </main>
  );
}
