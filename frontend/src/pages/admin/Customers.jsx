import { useEffect, useState } from "react";
import api from "../../api";
const money = value => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export default function Customers(){
 const [list,setList]=useState([]),[q,setQ]=useState(""),[message,setMessage]=useState(""),[detail,setDetail]=useState(null),[loading,setLoading]=useState(false);
 const load=async()=>{try{setList((await api.get("/customers")).data);setMessage("")}catch(e){setMessage(e.response?.data?.message||"Không tải được khách hàng.")}};
 useEffect(()=>{load()},[]);
 const showDetail=async id=>{try{setLoading(true);setDetail((await api.get(`/customers/${id}`)).data)}catch(e){setMessage(e.response?.data?.message||"Không tải được doanh số khách hàng.")}finally{setLoading(false)}};
 const filtered=list.filter(x=>[x.name,x.email,x.phone].join(" ").toLowerCase().includes(q.toLowerCase()));
 return <main className="container page"><div className="page-title-row"><div><span className="section-kicker">CRM</span><h1>Quản lý khách hàng</h1><p className="muted">Theo dõi số lượt đặt, doanh số/chi tiêu và đơn đã hủy của từng khách.</p></div><button className="outline-btn" onClick={load}>↻ Làm mới</button></div>
 {message&&<div className="error">{message}</div>}
 <div className="customer-toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm theo tên, email hoặc số điện thoại..."/><strong>{filtered.length} khách hàng</strong></div>
 <div className="tablewrap"><table><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Lịch đặt</th><th>Doanh số đã hoàn thành</th><th>Đơn hủy</th><th>Đánh giá</th><th></th></tr></thead><tbody>{filtered.length?filtered.map(c=><tr key={c._id}><td><strong>{c.name}</strong></td><td>{c.phone||"—"}<br/><small>{c.email}</small></td><td>{c.bookingCount}</td><td><strong>{money(c.spent)}</strong></td><td>{c.cancelledCount || 0}</td><td>{c.reviewCount} lượt</td><td><button className="outline-btn small-btn" onClick={()=>showDetail(c._id)}>Xem doanh số</button></td></tr>):<tr><td colSpan="7" style={{textAlign:"center"}}>Không có khách hàng phù hợp.</td></tr>}</tbody></table></div>
 {detail&&<div className="detail-overlay" onClick={()=>setDetail(null)}><section className="customer-detail panel-card" onClick={e=>e.stopPropagation()}><div className="page-title-row"><div><span className="section-kicker">CHI TIẾT KHÁCH HÀNG</span><h2>{detail.customer.name}</h2><p className="muted">{detail.customer.phone||""} · {detail.customer.email||""}</p></div><button className="outline-btn" onClick={()=>setDetail(null)}>Đóng</button></div>
 <div className="analytics-grid compact"><div className="summary-card"><span>Doanh số đã hoàn thành</span><strong>{money(detail.stats.revenue)}</strong></div><div className="summary-card"><span>Giá trị đơn chưa hủy</span><strong>{money(detail.stats.bookedValue)}</strong></div><div className="summary-card"><span>Đơn hoàn thành</span><strong>{detail.stats.completedCount}</strong></div><div className="summary-card"><span>Đơn đã hủy</span><strong>{detail.stats.cancelledCount}</strong></div></div>
 <h3>Lịch sử đơn hàng</h3><div className="tablewrap"><table><thead><tr><th>Ngày</th><th>Dịch vụ</th><th>Nhân viên</th><th>Tổng</th><th>Trạng thái</th><th>Lý do hủy</th></tr></thead><tbody>{detail.appointments.map(a=><tr key={a._id}><td>{a.date} {a.time}</td><td>{(a.services?.length?a.services:[a.service]).filter(Boolean).map(s=>s.name).join(" + ")}</td><td>{a.employee?.name||"—"}</td><td>{money((a.services?.length?a.services:[a.service]).filter(Boolean).reduce((sum,s)=>sum+Number(s.price||0),0)+(a.selectedSubServices||[]).reduce((sum,s)=>sum+Number(s.price||0),0))}</td><td><span className={`status ${a.status}`}>{a.status}</span></td><td>{a.cancellationReason||"—"}</td></tr>)}</tbody></table></div></section></div>}
 {loading&&<div className="loading-toast">Đang tải doanh số...</div>}
 </main>
}
