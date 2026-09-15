import {Routes,Route,Navigate} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminStaff from "./pages/admin/Staff";
import AdminBookings from "./pages/admin/Bookings";
import AdminSchedules from "./pages/admin/Schedules";
import StaffDashboard from "./pages/staff/Dashboard";
import Protected from "./components/Protected";
export default function App(){
 return <Routes>
  <Route element={<Layout/>}>
   <Route path="/" element={<Home/>}/><Route path="/services" element={<Services/>}/>
   <Route path="/booking" element={<Protected roles={["customer"]}><Booking/></Protected>}/>
   <Route path="/my-bookings" element={<Protected roles={["customer"]}><MyBookings/></Protected>}/>
   <Route path="/profile" element={<Protected><Profile/></Protected>}/>
   <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
   <Route path="/staff" element={<Protected roles={["staff"]}><StaffDashboard/></Protected>}/>
   <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard/></Protected>}/>
   <Route path="/admin/services" element={<Protected roles={["admin"]}><AdminServices/></Protected>}/>
   <Route path="/admin/staff" element={<Protected roles={["admin"]}><AdminStaff/></Protected>}/>
   <Route path="/admin/bookings" element={<Protected roles={["admin"]}><AdminBookings/></Protected>}/>
   <Route path="/admin/schedules" element={<Protected roles={["admin"]}><AdminSchedules/></Protected>}/>
   <Route path="*" element={<Navigate to="/" replace/>}/>
  </Route>
 </Routes>
}