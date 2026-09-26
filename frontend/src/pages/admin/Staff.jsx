import {useState} from "react";import {initialStaff,getData,saveData} from "../../data";
export default function Staff(){const [list,setList]=useState(()=>getData("staff",initialStaff));const empty={name:"",phone:"",specialty:"",status:"active"};const [f,setF]=useState(empty);const [edit,setEdit]=useState(null);function save(e){e.preventDefault();let a=edit?list.map(x=>x.id===edit?{...f,id:edit}:x):[...list,{...f,id:Date.now()}];saveData("staff",a);setList(a);setF(empty);setEdit(null)}function del(id){const a=list.filter(x=>x.id!==id);saveData("staff",a);setList(a)}return <main className="container page"><h1>Quản lý nhân viên</h1><div className="adminform"><form onSubmit={save}><input placeholder="Họ tên" value={f.name} onChange={e=>setF({...f,name:e.target.value})} required/><input placeholder="Số điện thoại" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><input placeholder="Chuyên môn" value={f.specialty} onChange={e=>setF({...f,specialty:e.target.value})}/><select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="active">Đang làm</option><option value="inactive">Nghỉ</option></select><button className="btn">{edit?"Cập nhật":"Thêm"}</button></form></div><div className="tablewrap"><table><thead><tr><th>Họ tên</th><th>Điện thoại</th><th>Chuyên môn</th><th>Trạng thái</th><th></th></tr></thead><tbody>{list.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.phone}</td><td>{s.specialty}</td><td>{s.status}</td><td><button onClick={()=>{setEdit(s.id);setF(s)}}>Sửa</button> <button className="danger" onClick={()=>del(s.id)}>Xóa</button></td></tr>)}</tbody></table></div></main>}

export default function Staff() {
  // 1. Khai báo danh sách nhân viên lấy từ dữ liệu mẫu
  const [staffList, setStaffList] = useState(getData("staff") || []);

  // 2. Khai báo trạng thái Form nhập liệu nhân viên mới
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    status: "active"
  });

  // Hàm xử lý thay đổi dữ liệu trong ô nhập
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi nhấn nút Thêm Nhân Viên
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Vui lòng điền tên và email nhân viên!");

    const newStaff = { ...form, id: Date.now() }; // Tạo ID tạm thời cho nhân viên mới
    setStaffList([...staffList, newStaff]);
    // Reset lại form trống
    setForm({ name: "", email: "", phone: "", role: "staff", status: "active" });
    alert("Thêm nhân viên mới thành công!");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>👥 QUẢN LÝ HỒ SƠ NHÂN VIÊN</h2>

      {/* KHU VỰC 1: FORM THÊM NHÂN VIÊN MỚI */}
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: 0 }}>Thêm Nhân Viên Mới</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px", gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Họ và Tên:</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} placeholder="Ví dụ: Nguyễn Văn A..." />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Địa chỉ Email:</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} placeholder="example@gmail.com" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Số điện thoại:</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} placeholder="0987xxxxxx" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Chức vụ:</label>
            <select name="role" value={form.role} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
              <option value="staff">Nhân viên phục vụ (Staff)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" style={{ background: "#28a745", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>➕ Kích Hoạt Tài Khoản Nhân Viên</button>
          </div>
        </form>
      </div>

      {/* KHU VỰC 2: BẢNG HIỂN THỊ HỒ SƠ NHÂN VIÊN */}
      <div>
        <h3>Danh Sách Hồ Sơ Nhân Viên</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#28a745", color: "#fff" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Họ và Tên</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Số Điện Thoại</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Vai Trò</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((person, index) => (
              <tr key={person.id || index} style={{ background: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "bold" }}>{person.name}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{person.email}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{person.phone || "Chưa cập nhật"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span style={{ textTransform: "uppercase", fontSize: "12px", fontWeight: "bold", color: person.role === "admin" ? "#dc3545" : "#007bff" }}>
                    {person.role}
                  </span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span style={{ background: "#d4edda", color: "#155724", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}