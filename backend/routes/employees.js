const router=require("express").Router();
const User=require("../models/User");
const {auth}=require("../middleware/auth");
router.get("/",auth,async(req,res)=>res.json(await User.find({role:"employee"}).select("name email")));
module.exports=router;