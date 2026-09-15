export const initialServices=[
 {id:1,name:"Cắt tóc",description:"Cắt tóc nam/nữ chuyên nghiệp",duration:30,price:100000,status:"active"},
 {id:2,name:"Gội đầu",description:"Gội đầu và chăm sóc tóc",duration:30,price:80000,status:"active"},
 {id:3,name:"Massage",description:"Massage thư giãn toàn thân",duration:60,price:300000,status:"active"},
 {id:4,name:"Chăm sóc da",description:"Chăm sóc và làm sạch da",duration:60,price:250000,status:"active"},
 {id:5,name:"Tư vấn",description:"Tư vấn dịch vụ trực tiếp",duration:30,price:150000,status:"active"}
];
export const initialStaff=[
 {id:1,name:"Nguyễn Văn A",phone:"0901000001",specialty:"Cắt tóc",status:"active"},
 {id:2,name:"Trần Văn B",phone:"0901000002",specialty:"Massage",status:"active"},
 {id:3,name:"Lê Thị C",phone:"0901000003",specialty:"Chăm sóc da",status:"active"}
];
export const times=["08:00","09:00","10:00","11:00","13:30","14:30","15:30","16:30","17:30"];
export const getData=(key,fallback)=>JSON.parse(localStorage.getItem(key)||"null")??fallback;
export const saveData=(key,data)=>localStorage.setItem(key,JSON.stringify(data));