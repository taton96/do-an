import { useEffect,useState } from "react";
import {useAuth} from "../../context/AuthContext";
import api from "../../api";
const labels={pending:"Chờ xác nhận",confirmed:"Đã xác nhận",completed:"Hoàn thành",cancelled:"Đã hủy"};
export default function Dashboard(){const {user}=useAuth();
const [list,setList]=useState([]),[message,setMessage]=useState("");
const load=()=>api.get("/appointments").then(r=>setList(r.data)).catch(e=>setMessage(e.response?.data?.message||"Không tải được lịch."));
useEffect(()=>{load()},[]);
const update=(id,status)=>api.put(`/appointments/${id}/status`,{status}).then(load).catch(e=>setMessage(e.response?.data?.message||"Không cập nhật được."));
return <main className="container page"><h1>Lịch làm việc</h1><p>Nhân viên: <b>{user?.name}</b></p>{message&&<div className="error">{message}</div>}{!list.length?<div className="empty">Chưa có lịch được xếp.</div>:<div className="tablewrap"><table><thead><tr><th>Khách</th><th>Dịch vụ</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th><th></th></tr></thead><tbody>{list.map(b=><tr key={b._id}><td>{b.customer?.name}</td><td>{(b.services?.length?b.services:[b.service]).filter(Boolean).map(x=>x.name).join(" + ")}</td><td>{b.date}</td><td>{b.time}</td><td><span className={"status "+b.status}>{labels[b.status]}</span></td><td>{b.status==="pending"&&<button onClick={()=>update(b._id,"confirmed")}>Xác nhận</button>}{b.status==="confirmed"&&<button onClick={()=>update(b._id,"completed")}>Hoàn thành</button>}</td></tr>)}</tbody></table></div>}</main>}
