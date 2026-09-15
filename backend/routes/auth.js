const router=require("express").Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");

router.post("/register",async(req,res)=>{
 try{
  const {name,email,password}=req.body;
  if(!name||!email||!password)return res.status(400).json({message:"Vui lòng nhập đủ thông tin"});
  if(await User.findOne({email}))return res.status(400).json({message:"Email đã tồn tại"});
  const user=await User.create({name,email,password:await bcrypt.hash(password,10)});
  res.status(201).json({message:"Đăng ký thành công",user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
});
router.post("/login",async(req,res)=>{
 try{
  const user=await User.findOne({email:req.body.email});
  if(!user||!(await bcrypt.compare(req.body.password,user.password)))return res.status(401).json({message:"Sai email hoặc mật khẩu"});
  const token=jwt.sign({id:user._id,name:user.name,email:user.email,role:user.role},process.env.JWT_SECRET||"secret",{expiresIn:"7d"});
  res.json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;