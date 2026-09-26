import { useEffect, useState } from "react";
import api from "../../api";
const labels={pending:"Chờ xác nhận",confirmed:"Đã xác nhận",completed:"Hoàn thành",cancelled:"Đã hủy"};
export default function Bookings(){
 const [list,setList]=useState([]),[staff,setStaff]=useState([]),[message,setMessage]=useState("");
 const load=async()=>{const [a,e]=await Promise.all([api.get("/appointments"),api.get("/employees")]);setList(a.data);setStaff(e.data)};
 useEffect(()=>{load().catch(err=>setMessage(err.response?.data?.message||"Không tải được lịch hẹn."));},[]);
 const assign=async(id,employee)=>{try{await api.put(`/appointments/${id}/assign`,{employee});await load();}catch(err){setMessage(err.response?.data?.message||"Không thể xếp nhân viên.");}};
 const status=async(id,v)=>{try{await api.put(`/appointments/${id}/status`,{status:v});await load();}catch(err){setMessage(err.response?.data?.message||"Không thể đổi trạng thái.");}};
 return <main className="container page"><h1>Quản lý lịch hẹn</h1>
 {message&&<div className="error">{message}</div>}
 <div className="tablewrap"><table><thead><tr><th>Khách hàng</th>
 <th>Dịch vụ</th><th>Nhân viên / Xếp ca</th>
 <th>Ngày</th><th>Giờ</th><th>Trạng thái</th></tr>
 </thead><tbody>{list.map(b=><tr key={b._id}><td>{b.customer?.name}</td
 <td>{(b.services?.length?b.services:[b.service]).filter(Boolean).map(x=>x.name).join(" + ")}</td>
 <td><select value={b.employee?._id||""} onChange={e=>assign(b._id,e.target.value)} disabled={b.status==="cancelled"}>
    <option value="">-- Chưa xếp --</option>
    {staff.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}
    </select></td><td>{b.date}</td><td>{b.time}</td><td>
        <select value={b.status} onChange={e=>status(b._id,e.target.value)}>
            <option value="pending">Chờ xác nhận</option><option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option></select></td></tr>)}</tbody></table></div></main>;
}
