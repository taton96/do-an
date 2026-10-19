import { useEffect, useState } from "react";
import api from "../../api";

const today = new Date().toISOString().slice(0, 10);

export default function Schedules() {
  const [staff, setStaff] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [f, setF] = useState({ employee: "", date: today, startTime: "09:00", endTime: "17:00" });
  const [leaveForm, setLeaveForm] = useState({ employee: "", date: today, reason: "Nghỉ phép", note: "" });

  const load = async () => {
    const [e, s] = await Promise.all([api.get("/employees"), api.get("/schedules")]);
    setStaff(e.data);
    setSchedules(s.data.schedules || []);
    setLeaves(s.data.leaves || []);
    if (e.data[0]) {
      setF(x => ({ ...x, employee: x.employee || e.data[0]._id }));
      setLeaveForm(x => ({ ...x, employee: x.employee || e.data[0]._id }));
    }
  };

  useEffect(() => {
    load().catch(err => { setError(true); setMessage(err.response?.data?.message || "Không tải được dữ liệu ca làm."); });
  }, []);

  const addShift = async e => {
    e.preventDefault();
    try {
      setError(false); setMessage("");
      if (!f.employee || !f.date) { setError(true); return setMessage("Vui lòng chọn nhân viên và ngày làm."); }
      await api.post("/schedules/work", f);
      setMessage("Đã xếp ca làm thành công.");
      await load();
    } catch (err) { setError(true); setMessage(err.response?.data?.message || "Không thể thêm ca làm."); }
  };

  const addLeave = async e => {
    e.preventDefault();
    try {
      setError(false); setMessage("");
      if (!leaveForm.employee || !leaveForm.date) { setError(true); return setMessage("Vui lòng chọn nhân viên và ngày nghỉ."); }
      await api.post("/schedules/leave", leaveForm);
      setMessage("Đã lưu lịch nghỉ cho nhân viên.");
      setLeaveForm(x => ({ ...x, reason: "Nghỉ phép", note: "" }));
      await load();
    } catch (err) { setError(true); setMessage(err.response?.data?.message || "Không thể xếp ngày nghỉ."); }
  };

  const remove = async (id, type) => {
    if (!window.confirm(type === "leave" ? "Delete lịch nghỉ này?" : "Delete ca làm này?")) return;
    try {
      await api.delete(type === "leave" ? `/schedules/leave/${id}` : `/schedules/work/${id}`);
      setError(false); setMessage(type === "leave" ? "Đã xóa lịch nghỉ." : "Đã xóa ca làm.");
      await load();
    } catch (err) { setError(true); setMessage(err.response?.data?.message || "Không thể xóa dữ liệu."); }
  };

  return (
    <main className="container page staff-schedule-page">
      <div className="section-title">
        <div><p style={{ color: "#64748b", marginBottom: 6 }}>QUẢN LÝ NHÂN SỰ</p><h1 style={{ margin: 0 }}>Ca làm & lịch nghỉ</h1><p style={{ color: "#64748b" }}>Sắp xếp giờ làm, chủ động lên lịch nghỉ và theo dõi lịch của từng nhân viên.</p></div>
      </div>

      {message && <div className={error ? "error" : "schedule-success"} role="status">{message}</div>}

      <div className="stats staff-schedule-stats">
        <div><b>{staff.length}</b><span>Nhân viên</span></div>
        <div><b>{schedules.length}</b><span>Ca làm đã xếp</span></div>
        <div><b>{leaves.length}</b><span>Date nghỉ đã xếp</span></div>
      </div>

      <div className="split staff-schedule-forms">
        <section className="formbox">
          <span className="schedule-kicker">01 · PHÂN CA</span>
          <h2>Xếp ca làm cho nhân viên</h2>
          <p className="hint">Chọn nhân viên, ngày làm và giờ bắt đầu/kết thúc.</p>
          <form onSubmit={addShift}>
            <label>Nhân viên<select required value={f.employee} onChange={e => setF({ ...f, employee: e.target.value })}><option value="">Chọn nhân viên</option>{staff.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}</select></label>
            <label>Date làm<input type="date" required min={today} value={f.date} onChange={e => setF({ ...f, date: e.target.value })}/></label>
            <div className="split schedule-time-fields">
              <label>Time bắt đầu<input type="time" required value={f.startTime} onChange={e => setF({ ...f, startTime: e.target.value })}/></label>
              <label>Time kết thúc<input type="time" required value={f.endTime} onChange={e => setF({ ...f, endTime: e.target.value })}/></label>
            </div>
            <button className="btn" type="submit">＋ Save ca làm</button>
          </form>
        </section>

        <section className="formbox">
          <span className="schedule-kicker">02 · NGÀY NGHỈ</span>
          <h2>Sắp xếp lịch nghỉ</h2>
          <p className="hint">Date nghỉ sẽ không hiển thị khung giờ đặt lịch cho nhân viên đó.</p>
          <form onSubmit={addLeave}>
            <label>Nhân viên<select required value={leaveForm.employee} onChange={e => setLeaveForm({ ...leaveForm, employee: e.target.value })}><option value="">Chọn nhân viên</option>{staff.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}</select></label>
            <label>Date nghỉ<input type="date" required min={today} value={leaveForm.date} onChange={e => setLeaveForm({ ...leaveForm, date: e.target.value })}/></label>
            <label>Lý do nghỉ<select value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}><option>Nghỉ phép</option><option>Nghỉ cá nhân</option><option>Nghỉ ốm</option><option>Đào tạo</option><option>Lý do khác</option></select></label>
            <label>Ghi chú (không bắt buộc)<textarea rows="2" value={leaveForm.note} onChange={e => setLeaveForm({ ...leaveForm, note: e.target.value })} placeholder="Ví dụ: nghỉ buổi sáng, có thể liên hệ quản lý..."/></label>
            <button className="btn" type="submit">＋ Save ngày nghỉ</button>
          </form>
        </section>
      </div>

      <section className="staff-schedule-list">
        <div className="section-title"><div><h2>Ca làm đã xếp</h2><p className="hint">Các ca làm cụ thể đang được lưu trên hệ thống.</p></div></div>
        <div className="tablewrap"><table><thead><tr><th>Nhân viên</th><th>Date</th><th>Khung giờ</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {schedules.map(x => <tr key={x._id}><td><strong>{x.employee?.name || "Nhân viên"}</strong></td><td>{x.date || `Lặp theo thứ ${x.dayOfWeek}`}</td><td>{x.startTime} – {x.endTime}</td><td><span className="status confirmed">Đang áp dụng</span></td><td><button className="danger" type="button" onClick={() => remove(x._id, "shift")}>Delete ca</button></td></tr>)}
          {!schedules.length && <tr><td colSpan="5">Chưa có ca làm nào.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="staff-schedule-list">
        <div className="section-title"><div><h2>Lịch nghỉ nhân viên</h2><p className="hint">Có thể hủy lịch nghỉ nếu nhân viên thay đổi kế hoạch.</p></div></div>
        <div className="tablewrap"><table><thead><tr><th>Nhân viên</th><th>Date nghỉ</th><th>Lý do</th><th>Ghi chú</th><th>Actions</th></tr></thead><tbody>
          {leaves.map(x => <tr key={x._id}><td><strong>{x.employee?.name || "Nhân viên"}</strong></td><td>{x.date}</td><td>{x.reason || "Nghỉ theo lịch"}</td><td>{x.note || "—"}</td><td><button className="danger" type="button" onClick={() => remove(x._id, "leave")}>Cancel lịch nghỉ</button></td></tr>)}
          {!leaves.length && <tr><td colSpan="5">Chưa có lịch nghỉ nào.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  );
}
