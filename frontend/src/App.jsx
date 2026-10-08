import {Routes,Route,Navigate} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminStaff from "./pages/admin/Staff";
import AdminBookings from "./pages/admin/Bookings";
import AdminSchedules from "./pages/admin/Schedules";
import StaffDashboard from "./pages/staff/Dashboard";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import Reviews from "./pages/Reviews";
import AdminCustomers from "./pages/admin/Customers";
import Protected from "./components/Protected";
export default function App(){
 return <Routes>
  <Route element={<Layout/>}>
   <Route path="/" element={<Home/>}/>
   <Route path="/booking" element={<Booking/>}/>
   <Route path="/booking/:serviceSlug" element={<Booking/>}/>
   <Route path="/login" element={<Login/>}/>
   <Route path="/profile" element={<Protected><Profile/></Protected>}/>
   <Route path="/my-bookings" element={<Protected roles={["customer"]}><MyBookings/></Protected>}/>
   <Route path="/reviews" element={<Protected><Reviews/></Protected>}/>
   <Route path="/staff" element={<Protected roles={["employee"]}><StaffDashboard/></Protected>}/>
   <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard/></Protected>}/>
   <Route path="/admin/services" element={<Protected roles={["admin"]}><AdminServices/></Protected>}/>
   <Route path="/admin/staff" element={<Protected roles={["admin"]}><AdminStaff/></Protected>}/>
   <Route path="/admin/bookings" element={<Protected roles={["admin"]}><AdminBookings/></Protected>}/>
   <Route path="/admin/schedules" element={<Protected roles={["admin"]}><AdminSchedules/></Protected>}/>
   <Route path="/admin/customers" element={<Protected roles={["admin"]}><AdminCustomers/></Protected>}/>
   <Route path="/admin/reviews" element={<Protected roles={["admin"]}><Reviews/></Protected>}/>
   <Route path="*" element={<Navigate to="/" replace/>}/>
  </Route>
 </Routes>
}