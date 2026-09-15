const mongoose=require("mongoose");
module.exports=mongoose.model("Appointment",new mongoose.Schema({
 customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",required:true},
 date:{type:String,required:true},
 time:{type:String,required:true},
 note:String,
 status:{type:String,enum:["pending","confirmed","completed","cancelled"],default:"pending"}
},{timestamps:true}));