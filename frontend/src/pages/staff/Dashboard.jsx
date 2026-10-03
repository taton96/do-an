import { useEffect,useState } from "react";
import {useAuth} from "../../context/AuthContext";
import api from "../../api";
const labels={pending:"Chờ xác nhận",confirmed:"Đã xác nhận",completed:"Hoàn thành",cancelled:"Đã hủy"};
export default function Dashboard(){const {user}=useAuth();
const [list,setList]=useState([]),[message,setMessage]=useState("");
const load=()=>api.get("/appointments").then(r=>setList(Array.isArray(r.data)?r.data:[])).catch(e=>setMessage(e.response?.data?.message||"Không tải được lịch."));
useEffect(()=>{
  load();
  // Tự cập nhật để nhân viên nhận lịch ngay sau khi admin xếp ca.
  const timer=setInterval(load,5000);
  return ()=>clearInterval(timer);
},[]);
const update=(id,status)=>api.put(`/appointments/${id}/status`,{status}).then(load).catch(e=>setMessage(e.response?.data?.message||"Không cập nhật được."));
return <main className="container page"><div className="page-title-row"><div><h1>Lịch làm việc</h1><p className="muted">Lịch được admin xếp sẽ tự cập nhật tại đây.</p><p>Nhân viên: <b>{user?.name}</b></p></div><button type="button" className="outline-btn" onClick={load}>↻ Làm mới</button></div>{message&&<div className="error">{message}</div>}{!list.length?<div className="empty">Chưa có lịch được xếp.</div>:<div className="tablewrap"><table><thead><tr><th>Số điện thoại</th><th>Dịch vụ</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th><th></th></tr></thead><tbody>{list.map(b=><tr key={b._id}><td>{b.customerPhone || b.customer?.phone || "Không có SĐT"}</td><td>{(b.services?.length?b.services:[b.service]).filter(Boolean).map(x=>x.name).join(" + ")}</td><td>{b.date}</td><td>{b.time}</td><td><span className={"status "+b.status}>{labels[b.status]}</span></td><td>{b.status==="pending"&&<button onClick={()=>update(b._id,"confirmed")}>Xác nhận</button>}{b.status==="confirmed"&&<button onClick={()=>update(b._id,"completed")}>Hoàn thành</button>}</td></tr>)}</tbody></table></div>}</main>}
