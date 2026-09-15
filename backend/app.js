require("dotenv").config();
const express=require("express"),cors=require("cors"),mongoose=require("mongoose"),bcrypt=require("bcryptjs");
const User=require("./models/User"),Service=require("./models/Service");
const app=express();
app.use(cors());app.use(express.json());
app.use("/api/auth",require("./routes/auth"));
app.use("/api/services",require("./routes/services"));
app.use("/api/appointments",require("./routes/appointments"));
app.use("/api/employees",require("./routes/employees"));
app.use("/api/schedules",require("./routes/schedules"));
app.get("/",(req,res)=>res.json({message:"Booking System API",status:"running"}));
app.get("/api/dashboard",require("./middleware/auth").auth,require("./middleware/auth").role("admin"),async(req,res)=>{
 const Appointment=require("./models/Appointment");
 res.json({
  services:await Service.countDocuments(),
  users:await User.countDocuments(),
  appointments:await Appointment.countDocuments(),
  pending:await Appointment.countDocuments({status:"pending"}),
  completed:await Appointment.countDocuments({status:"completed"})
 });
});
async function seed(){
 if(!await User.findOne({email:"admin@gmail.com"}))await User.create({name:"Quản trị viên",email:"admin@gmail.com",password:await bcrypt.hash("123456",10),role:"admin"});
 if(await Service.countDocuments()===0)await Service.insertMany([
  {name:"Cắt tóc",description:"Cắt và tạo kiểu tóc",duration:45,price:100000},
  {name:"Gội đầu",description:"Gội đầu thư giãn",duration:30,price:70000},
  {name:"Chăm sóc da",description:"Chăm sóc da cơ bản",duration:60,price:250000}
 ]);
}
mongoose.connect(process.env.MONGO_URI||"mongodb://127.0.0.1:27017/booking_system").then(async()=>{
 await seed();app.listen(process.env.PORT||3000,()=>console.log("Booking API: http://localhost:3000"));
}).catch(e=>console.error("MongoDB error:",e.message));