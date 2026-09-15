const mongoose=require("mongoose");
module.exports=mongoose.model("WorkSchedule",new mongoose.Schema({
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 dayOfWeek:{type:Number,required:true},
 startTime:{type:String,required:true},
 endTime:{type:String,required:true},
 active:{type:Boolean,default:true}
}));