import { useState } from "react";
import { initialStaff, getData, saveData } from "../../data";

export default function Staff() {
  const [list, setList] = useState(() => getData("staff", initialStaff));
  const empty = { name: "", phone: "", specialty: "", status: "active" };
  const [f, setF] = useState(empty);
  const [edit, setEdit] = useState(null);

  function save(e) {
    e.preventDefault();
    const data = edit
      ? list.map(x => x.id === edit ? { ...f, id: edit } : x)
      : [...list, { ...f, id: Date.now() }];

    saveData("staff", data);
    setList(data);
    setF(empty);
    setEdit(null);
  }

  function del(id) {
    const data = list.filter(x => x.id !== id);
    saveData("staff", data);
    setList(data);
  }

  return (
    <main className="container page">
      <h1>Quản lý nhân viên</h1>

      <div className="adminform">
        <form onSubmit={save}>
          <input
            placeholder="Họ tên"
            value={f.name}
            onChange={e => setF({ ...f, name: e.target.value })}
            required
          />
          <input
            placeholder="Số điện thoại"
            value={f.phone}
            onChange={e => setF({ ...f, phone: e.target.value })}
          />
          <input
            placeholder="Chuyên môn"
            value={f.specialty}
            onChange={e => setF({ ...f, specialty: e.target.value })}
          />
          <select
            value={f.status}
            onChange={e => setF({ ...f, status: e.target.value })}
          >
            <option value="active">Đang làm</option>
            <option value="inactive">Nghỉ</option>
          </select>
          <button className="btn" type="submit">
            {edit ? "Cập nhật" : "Thêm"}
          </button>
          {edit && (
            <button
              type="button"
              onClick={() => { setEdit(null); setF(empty); }}
            >
              Hủy sửa
            </button>
          )}
        </form>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Điện thoại</th>
              <th>Chuyên môn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone || "-"}</td>
                <td>{s.specialty || "-"}</td>
                <td>{s.status === "active" ? "Đang làm" : "Nghỉ"}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => { setEdit(s.id); setF({ ...empty, ...s }); }}
                  >
                    Sửa
                  </button>{" "}
                  <button className="danger" type="button" onClick={() => del(s.id)}>
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
