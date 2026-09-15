const router=require("express").Router();
const WorkSchedule=require("../models/WorkSchedule");
const Holiday=require("../models/Holiday");
const {auth,role}=require("../middleware/auth");
router.get("/",auth,async(req,res)=>res.json({schedules:await WorkSchedule.find().populate("employee","name"),holidays:await Holiday.find().sort({date:1})}));
router.post("/work",auth,role("admin"),async(req,res)=>res.status(201).json(await WorkSchedule.create(req.body)));
router.post("/holiday",auth,role("admin"),async(req,res)=>res.status(201).json(await Holiday.create(req.body)));
module.exports=router;