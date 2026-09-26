import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import api from "../api";
import {initialServices} from "../data";

export default function Services(){
 const [search,setSearch]=useState("");
 const [services,setServices]=useState(initialServices);
 useEffect(()=>{api.get("/services").then(r=>setServices(r.data)).catch(()=>{});},[]);
 const filtered=services.filter(s=>s.active!==false && s.name.toLowerCase().includes(search.toLowerCase()));
 return <main className="container page">
  <div className="section-title"><h1>Dịch vụ</h1><input className="search" placeholder="Tìm dịch vụ..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
  <div className="grid">
   {filtered.map(s=><div className="card service-card" key={s._id||s.id}>
    <img className="service-image" src={s.image||`/images/services/${(s.name||"cat-toc").toLowerCase().replaceAll(" ","-")}.svg`} alt={s.name}/>
    <h2>{s.name}</h2><p>{s.description}</p>
    <div className="row"><span>{s.duration} phút</span><b>{Number(s.price||0).toLocaleString("vi-VN")}đ</b></div>
    <Link to="/booking" className="btn small">Đặt lịch</Link>
   </div>)}
  </div>
 </main>;
}
