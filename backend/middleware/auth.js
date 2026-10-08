const jwt=require("jsonwebtoken");
function auth(req,res,next){
 const token=(req.headers.authorization||"").replace("Bearer ","");
 if(!token)return res.status(401).json({message:"Chưa đăng nhập"});
 try{req.user=jwt.verify(token,process.env.JWT_SECRET||"secret");next();}
 catch(e){res.status(401).json({message:"Token không hợp lệ"});}
}
function optionalAuth(req,res,next){
 const token=(req.headers.authorization||"").replace("Bearer ","");
 if(!token) return next();
 try{
  req.user=jwt.verify(token,process.env.JWT_SECRET||"secret");
 }catch(e){
  // Token hết hạn/không hợp lệ thì coi như khách chưa đăng nhập.
 }
 next();
}
function role(...roles){
 return (req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:"Không có quyền"});
}
module.exports={auth,optionalAuth,role};