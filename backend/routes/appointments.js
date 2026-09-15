const router=require("express").Router();
const Appointment=require("../models/Appointment");
const {auth,role}=require("../middleware/auth");
router.get("/",auth,async(req,res)=>{
 const q=req.user.role==="customer"?{customer:req.user.id}:req.user.role==="employee"?{employee:req.user.id}:{};
 res.json(await Appointment.find(q).populate("customer","name email").populate("employee","name").populate("service","name price duration").sort({date:1,time:1}));
});
router.post("/",auth,role("customer"),async(req,res)=>{
 try{
  const {service,employee,date,time,note}=req.body;
  const q={date,time,status:{$in:["pending","confirmed"]}};
  if(employee)q.employee=employee;
  const busy=await Appointment.findOne(q);
  if(busy)return res.status(400).json({message:"Khung giờ này đã có lịch"});
  res.status(201).json(await Appointment.create({customer:req.user.id,service,employee:employee||undefined,date,time,note}));
 }catch(e){res.status(400).json({message:e.message});}
});
router.put("/:id/status",auth,async(req,res)=>{
 const allowed=req.user.role==="admin"?["pending","confirmed","completed","cancelled"]:req.user.role==="employee"?["confirmed","completed"]:["cancelled"];
 if(!allowed.includes(req.body.status))return res.status(403).json({message:"Không thể đổi trạng thái"});
 res.json(await Appointment.findByIdAndUpdate(req.params.id,{status:req.body.status,note:req.body.note},{new:true}));
});
router.delete("/:id",auth,async(req,res)=>{
 const a=await Appointment.findById(req.params.id);
 if(!a)return res.status(404).json({message:"Không tìm thấy lịch"});
 if(req.user.role==="customer"&&String(a.customer)!==req.user.id)return res.status(403).json({message:"Không có quyền"});
 a.status="cancelled";await a.save();res.json({message:"Đã hủy lịch"});
});
module.exports=router;