import {createContext,useContext,useState} from "react";
const AuthContext=createContext();
const seedUsers=[
 {id:1,name:"Nguyễn Văn Admin",email:"admin@gmail.com",password:"123456",role:"admin"},
 {id:2,name:"Nguyễn Văn A",email:"staff@gmail.com",password:"123456",role:"staff"},
 {id:3,name:"Khách hàng",email:"customer@gmail.com",password:"123456",role:"customer"}
];
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("booking_user")||"null"));
 const login=(email,password)=>{
   const users=JSON.parse(localStorage.getItem("booking_users")||"null")||seedUsers;
   const u=users.find(x=>x.email===email&&x.password===password);
   if(!u) throw Error("Email hoặc mật khẩu không đúng");
   const safe={id:u.id,name:u.name,email:u.email,role:u.role};
   localStorage.setItem("booking_user",JSON.stringify(safe));setUser(safe);return safe;
 };
 const register=(data)=>{
   const users=JSON.parse(localStorage.getItem("booking_users")||"null")||seedUsers;
   if(users.some(x=>x.email===data.email)) throw Error("Email đã tồn tại");
   const u={...data,id:Date.now(),role:"customer"}; users.push(u);
   localStorage.setItem("booking_users",JSON.stringify(users)); return login(data.email,data.password);
 };
 const logout=()=>{localStorage.removeItem("booking_user");setUser(null)};
 return <AuthContext.Provider value={{user,login,register,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);