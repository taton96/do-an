import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Login() {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");


  // Xử lý đăng nhập
  async function submit(event) {

    event.preventDefault();

    try {

      const user = await login(
        form.email,
        form.password
      );

      // Chuyển trang theo quyền
      if (user.role === "admin") {
        navigate("/admin");

      } else if (user.role === "employee") {
        navigate("/staff");

      } else {
        navigate("/");
      }

    } catch (error) {

      setError(error.message);

    }
  }


  return (
    <main className="auth">

      <div className="formbox">

        <h1>
          Đăng nhập
        </h1>
        {/* Thông báo lỗi */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* Form đăng nhập */}
        <form onSubmit={submit}>

          <label>
            Email hoặc số điện thoại

            <input
              type="text"
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


          <label>
            Mật khẩu

            <input
              type="password"
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


          <button
            type="submit"
            className="btn"
          >
            Đăng nhập
          </button>

        </form>




      </div>

    </main>
  );
}