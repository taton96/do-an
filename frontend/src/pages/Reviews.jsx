import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
const Stars=({value,onChange})=><div className="review-stars">{[1,2,3,4,5].map(n=><button key={n} type="button" className={n<=value?"selected":""} onClick={()=>onChange?.(n)}>★</button>)}</div>;
export default function Reviews(){
 const {user}=useAuth(); const admin=user?.role==="admin";
 const [eligible,setEligible]=useState([]),[reviews,setReviews]=useState([]),[rating,setRating]=useState(5),[comment,setComment]=useState(""),[appointment,setAppointment]=useState(""),[message,setMessage]=useState("");
 const load=async()=>{try{const [r,e]=await Promise.all([api.get("/reviews"),admin?Promise.resolve({data:[]}):api.get("/reviews/eligible")]);setReviews(r.data);setEligible(e.data);if(!appointment&&e.data[0])setAppointment(e.data[0]._id)}catch(err){setMessage(err.response?.data?.message||"Không tải được đánh giá.")}};
 useEffect(()=>{load()},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/reviews",{appointment,rating,comment});setComment("");setMessage("Đã gửi đánh giá thành công.");await load()}catch(err){setMessage(err.response?.data?.message||"Không thể gửi đánh giá.")}};
 const remove=async id=>{if(!confirm("Xóa đánh giá này?"))return;await api.delete(`/reviews/${id}`);load()};
 return <main className="container page reviews-page"><div className="page-title-row"><div><span className="section-kicker">FEEDBACK</span><h1>Đánh giá dịch vụ</h1><p className="muted">{admin?"Theo dõi phản hồi của khách hàng.":"Chia sẻ trải nghiệm sau mỗi lịch đã hoàn thành."}</p></div></div>{message&&<div className="success">{message}</div>}
 {!admin&&<form className="review-form panel-card" onSubmit={submit}><h2>Viết đánh giá</h2>{eligible.length?<><label>Lịch đã hoàn thành<select value={appointment} onChange={e=>setAppointment(e.target.value)}>{eligible.map(a=><option key={a._id} value={a._id}>{a.date} {a.time} — {(a.services?.length?a.services:[a.service]).filter(Boolean).map(s=>s.name).join(" + ")}</option>)}</select></label><label>Mức đánh giá<Stars value={rating} onChange={setRating}/></label><label>Nhận xét<textarea rows="4" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Bạn cảm nhận thế nào về dịch vụ?"/></label><button className="btn" type="submit">Gửi đánh giá</button></>:<div className="empty">Bạn chưa có lịch hoàn thành chưa được đánh giá.</div>}</form>}
 <section className="review-list panel-card"><h2>Danh sách đánh giá</h2>{reviews.length?reviews.map(r=><article className="review-item" key={r._id}><div><strong>{r.customer?.name||"Khách hàng"}</strong><span>{r.service?.name||"Dịch vụ"} · {r.appointment?.date||""}</span></div><Stars value={r.rating}/><p>{r.comment||"Không có nhận xét."}</p>{admin&&<button className="danger" onClick={()=>remove(r._id)}>Xóa</button>}</article>):<div className="empty">Chưa có đánh giá.</div>}</section></main>
}
