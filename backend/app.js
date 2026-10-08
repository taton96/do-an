require("dotenv").config();
const express=require("express"),cors=require("cors"),mongoose=require("mongoose"),bcrypt=require("bcryptjs");
const User=require("./models/User"),Service=require("./models/Service"),WorkSchedule=require("./models/WorkSchedule");
const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",require("./routes/auth"));
app.use("/api/services",require("./routes/services"));
app.use("/api/appointments",require("./routes/appointments"));
app.use("/api/employees",require("./routes/employees"));
app.use("/api/customers",require("./routes/customers"));
app.use("/api/reviews",require("./routes/reviews"));
app.use("/api/schedules",require("./routes/schedules"));
app.get("/",(req,res)=>res.json({message:"Booking System API",status:"running"}));
app.get("/api/dashboard",require("./middleware/auth").auth,require("./middleware/auth").role("admin"),async(req,res)=>{
 const Appointment=require("./models/Appointment");
 const Review=require("./models/Review");
 const appointments=await Appointment.find({}).populate("services","price").populate("service","price").lean();
 const amountOf=a => (a.services?.length ? a.services : (a.service ? [a.service] : [])).reduce((sum,s)=>sum+Number(s?.price||0),0) + (a.selectedSubServices||[]).reduce((sum,s)=>sum+Number(s?.price||0),0);
 const completed=appointments.filter(a=>a.status==="completed");
 const confirmed=appointments.filter(a=>["confirmed","completed"].includes(a.status));
 const revenue=completed.reduce((sum,a)=>sum+amountOf(a),0);
 const confirmedValue=confirmed.reduce((sum,a)=>sum+amountOf(a),0);
 const month=new Date().toISOString().slice(0,7);
 const monthly=completed.filter(a=>String(a.date||"").startsWith(month)).reduce((sum,a)=>sum+amountOf(a),0);
 const rating=await Review.aggregate([{ $match:{visible:true} },{ $group:{_id:null,avg:{$avg:"$rating"},count:{$sum:1}}}]);
 res.json({services:await Service.countDocuments(),users:await User.countDocuments({role:"customer"}),appointments:appointments.length,pending:appointments.filter(a=>a.status==="pending").length,completed:completed.length,revenue,confirmedValue,monthlyRevenue:monthly,averageRating:rating[0]?.avg||0,reviewCount:rating[0]?.count||0});
});

async function seed(){
  let admin=await User.findOne({email:"admin@gmail.com"});
  if(!admin) admin=await User.create({name:"Quản trị viên",email:"admin@gmail.com",password:await bcrypt.hash("123456",10),role:"admin"});

  const employeeSeeds=[
    {name:"Nguyễn Văn A",email:"employee1@gmail.com"},
    {name:"Trần Văn B",email:"employee2@gmail.com"},
    {name:"Lê Thị C",email:"employee3@gmail.com"}
  ];
  const employees=[];
  for(const item of employeeSeeds){
    let e=await User.findOne({email:item.email});
    if(!e) e=await User.create({...item,password:await bcrypt.hash("123456",10),role:"employee"});
    employees.push(e);
  }

  const serviceSeeds=[
    {name:"Cắt tóc",description:"Tạo phong cách tóc gọn gàng, phù hợp khuôn mặt.",duration:45,price:100000,image:"/images/services/cat-toc-3d.jpg",active:true,subServices:[
      {name:"Cắt tóc nam",price:100000},{name:"Cắt tóc nữ",price:120000},{name:"Tạo kiểu tóc",price:50000},{name:"Lấy ráy tai",price:50000}
    ]},
    {name:"Massage",description:"Thư giãn cơ thể, giảm căng thẳng và mệt mỏi.",duration:60,price:300000,image:"/images/services/massage-3d.jpg",active:true,subServices:[
      {name:"Massage toàn thân",price:300000},{name:"Massage cổ vai gáy",price:180000},{name:"Massage chân",price:150000},{name:"Massage đá nóng",price:350000}
    ]},
    {name:"Chăm sóc da",description:"Chăm sóc làn da sạch khỏe, mềm mịn và tươi sáng.",duration:60,price:250000,image:"/images/services/cham-soc-da-3d.jpg",active:true,subServices:[
      {name:"Gội đầu xả",price:60000},{name:"Làm sạch da",price:80000},{name:"Cấp ẩm",price:100000},{name:"Trị mụn",price:150000},{name:"Chống lão hóa",price:200000}
    ]},
    {name:"Chăm sóc sức khỏe",description:"Theo dõi sức khỏe cơ bản và tư vấn chăm sóc cơ thể.",duration:30,price:150000,image:"/images/services/cham-soc-suc-khoe-3d.jpg",active:true,subServices:[
      {name:"Khám sức khỏe tổng quát",price:200000},{name:"Tư vấn dinh dưỡng",price:120000},{name:"Đo huyết áp",price:30000},{name:"Thư giãn trị liệu",price:100000}
    ]}
  ];
  const mainNames=serviceSeeds.map(service=>service.name);
  await Service.updateMany({name:{$nin:mainNames}},{$set:{active:false}});
  for(const service of serviceSeeds){
    await Service.updateOne({name:service.name},{$set:service}, {upsert:true});
  }

  // Tạo ca 09:00-17:00 cho nhân viên mẫu, từ thứ 2 đến chủ nhật.
  for(const employee of employees){
    for(let dayOfWeek=0;dayOfWeek<=6;dayOfWeek++){
      await WorkSchedule.updateOne(
        {employee:employee._id,dayOfWeek},
        {$setOnInsert:{employee:employee._id,dayOfWeek,startTime:"09:00",endTime:"17:00",active:true}},
        {upsert:true}
      );
    }
  }
}

mongoose.connect(process.env.MONGO_URI||"mongodb://127.0.0.1:27017/booking_system").then(async()=>{
 await seed();
 app.listen(process.env.PORT||3000,()=>console.log("Booking API: http://localhost:3000"));
}).catch(e=>console.error("MongoDB error:",e.message));
