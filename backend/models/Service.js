const mongoose=require("mongoose");
module.exports=mongoose.model("Service",new mongoose.Schema({
 name:{type:String,required:true},
 description:String,
 duration:{type:Number,default:60},
 price:{type:Number,default:0},
 active:{type:Boolean,default:true}
},{timestamps:true}));