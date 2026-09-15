const mongoose=require("mongoose");
module.exports=mongoose.model("Holiday",new mongoose.Schema({
 date:{type:String,required:true,unique:true},
 reason:String
}));