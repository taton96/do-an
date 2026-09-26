import {Link,Outlet,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
export default function Layout(){
 const {user,logout}=useAuth(),nav=useNavigate();
 return <><header>
    <Link className="logo" to="/">BOOKING</Link><nav>
 <Link to="/">Trang chủ</Link>
 <Link to="/services">Dịch vụ</Link>
 {user?.role==="customer"&&<Link to="/my-bookings">Lịch của tôi</Link>}
 {user?.role==="staff"&&<Link to="/staff">Nhân viên</Link>}
 {user?.role==="admin"&&<Link to="/admin">Quản trị</Link>}
 {!user?<Link to="/login">Đăng nhập</Link>:<><Link to="/profile">{user.name}</Link>
 <button className="linkbtn" onClick={()=>{logout();nav("/")}}>Đăng xuất</button></>}
 </nav></header><Outlet/>
 <footer><b>BOOKING SERVICE</b>
 <p>Đặt lịch nhanh chóng - Tiện lợi - Chuyên nghiệp</p><p>Hotline: 0123 456 789</p></footer></>
}