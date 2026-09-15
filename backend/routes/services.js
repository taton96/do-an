const router=require("express").Router();
const Service=require("../models/Service");
const {auth,role}=require("../middleware/auth");
router.get("/",async(req,res)=>res.json(await Service.find().sort({createdAt:-1})));
router.post("/",auth,role("admin"),async(req,res)=>res.status(201).json(await Service.create(req.body)));
router.put("/:id",auth,role("admin"),async(req,res)=>res.json(await Service.findByIdAndUpdate(req.params.id,req.body,{new:true})));
router.delete("/:id",auth,role("admin"),async(req,res)=>{await Service.findByIdAndDelete(req.params.id);res.json({message:"Đã xóa dịch vụ"});});
module.exports=router;