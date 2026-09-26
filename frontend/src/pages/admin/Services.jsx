import { useEffect, useState } from "react";
import api from "../../api";

const empty = {
  name: "",
  description: "",
  duration: 30,
  price: 0,
  active: true,
  image: "/images/services/cat-toc.svg"
};

export default function Services() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(empty);
  const [edit, setEdit] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/services");
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể tải dịch vụ.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...f,
      duration: Number(f.duration),
      price: Number(f.price),
      active: Boolean(f.active)
    };

    try {
      if (edit) {
        await api.put(`/services/${edit}`, payload);
      } else {
        await api.post("/services", payload);
      }

      setF(empty);
      setEdit(null);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể lưu dịch vụ.");
    }
  }

  async function del(id) {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;

    try {
      await api.delete(`/services/${id}`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể xóa dịch vụ.");
    }
  }

  return (
    <main className="container page">
      <h1>Quản lý dịch vụ</h1>

      {message && <div className="error">{message}</div>}

      <div className="adminform">
        <form onSubmit={save}>
          <input
            placeholder="Tên dịch vụ"
            value={f.name}
            onChange={e => setF({ ...f, name: e.target.value })}
            required
          />

          <input
            placeholder="Mô tả"
            value={f.description}
            onChange={e => setF({ ...f, description: e.target.value })}
          />

          <input
            type="number"
            min="1"
            placeholder="Thời lượng"
            value={f.duration}
            onChange={e => setF({ ...f, duration: e.target.value })}
            required
          />

          <input
            type="number"
            min="0"
            placeholder="Giá"
            value={f.price}
            onChange={e => setF({ ...f, price: e.target.value })}
            required
          />

          <select
            value={f.active ? "active" : "inactive"}
            onChange={e => setF({ ...f, active: e.target.value === "active" })}
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>

          <button className="btn" type="submit">
            {edit ? "Cập nhật" : "Thêm"}
          </button>

          {edit && (
            <button
              type="button"
              onClick={() => {
                setEdit(null);
                setF(empty);
              }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Thời lượng</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {list.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.duration} phút</td>
                <td>{Number(s.price || 0).toLocaleString("vi-VN")}đ</td>
                <td>{s.active === false ? "Ngừng hoạt động" : "Đang hoạt động"}</td>
                <td>
                  <button
                    onClick={() => {
                      setEdit(s._id);
                      setF({
                        name: s.name || "",
                        description: s.description || "",
                        duration: s.duration || 30,
                        price: s.price || 0,
                        active: s.active !== false,
                        image: s.image || "/images/services/cat-toc.svg"
                      });
                    }}
                  >
                    Sửa
                  </button>{" "}
                  <button className="danger" onClick={() => del(s._id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
