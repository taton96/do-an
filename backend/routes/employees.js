const router=require("express").Router();
const bcrypt=require("bcryptjs");
const User=require("../models/User");
const {auth,role}=require("../middleware/auth");

router.get("/",async(req,res)=>{
  const employees=await User.find({role:"employee"}).select("name email");
  res.json(employees);
});

router.post("/",auth,role("admin"),async(req,res)=>{
  try{
    const {name,email,password="123456"}=req.body;
    if(!name||!email) return res.status(400).json({message:"Vui lòng nhập họ tên và email"});
    if(await User.findOne({email})) return res.status(400).json({message:"Email đã tồn tại"});
    const employee=await User.create({name,email,password:await bcrypt.hash(password,10),role:"employee"});
    res.status(201).json({id:employee._id,name:employee.name,email:employee.email,role:employee.role});
  }catch(e){res.status(400).json({message:e.message});}
});

module.exports=router;
