const router=require("express").Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");

router.post("/login",async(req,res)=>{
 try{
  const identifier=String(req.body.email||req.body.phone||"").trim();
  const password=String(req.body.password||"");
  const user=await User.findOne({$or:[{email:identifier},{phone:identifier}]});
  if(!user||!(await bcrypt.compare(password,user.password)))return res.status(401).json({message:"Sai email/số điện thoại hoặc mật khẩu"});
  const token=jwt.sign({id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role},process.env.JWT_SECRET||"secret",{expiresIn:"7d"});
  res.json({token,user:{id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
});

const {auth}=require("../middleware/auth");

router.patch("/profile",auth,async(req,res)=>{
 try{
  const name=String(req.body.name||"").trim();
  if(!name)return res.status(400).json({message:"Họ và tên không được để trống"});
  const user=await User.findByIdAndUpdate(req.user.id,{name},{new:true,runValidators:true}).select("-password");
  if(!user)return res.status(404).json({message:"Không tìm thấy tài khoản"});
  res.json({message:"Cập nhật thông tin thành công",user:{id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
});

router.patch("/change-password",auth,async(req,res)=>{
 try{
  const currentPassword=String(req.body.currentPassword||"");
  const newPassword=String(req.body.newPassword||"");
  if(newPassword.length<6)return res.status(400).json({message:"Mật khẩu mới phải có ít nhất 6 ký tự"});
  const user=await User.findById(req.user.id);
  if(!user)return res.status(404).json({message:"Không tìm thấy tài khoản"});
  if(!(await bcrypt.compare(currentPassword,user.password)))return res.status(400).json({message:"Mật khẩu hiện tại không chính xác"});
  user.password=await bcrypt.hash(newPassword,10);
  await user.save();
  res.json({message:"Đổi mật khẩu thành công"});
 }catch(e){res.status(500).json({message:e.message});}
});

module.exports=router;
