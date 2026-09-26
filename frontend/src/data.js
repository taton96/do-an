export const initialServices=[
 {id:1,name:"Cắt tóc",description:"Cắt tóc nam/nữ chuyên nghiệp",duration:30,price:100000,status:"active",image:"/images/services/cat-toc.svg"},
 {id:2,name:"Gội đầu",description:"Gội đầu và chăm sóc tóc",duration:30,price:80000,status:"active",image:"/images/services/goi-dau.svg"},
 {id:3,name:"Massage",description:"Massage thư giãn toàn thân",duration:60,price:300000,status:"active",image:"/images/services/massage.svg"},
 {id:4,name:"Chăm sóc da",description:"Chăm sóc và làm sạch da",duration:60,price:250000,status:"active",image:"/images/services/cham-soc-da.svg"},
 {id:5,name:"Tư vấn",description:"Tư vấn dịch vụ trực tiếp",duration:30,price:150000,status:"active",image:"/images/services/tu-van.svg"},
 {id:6,name:"Lấy ráy tai",description:"Lấy ráy tai nhẹ nhàng, vệ sinh và thư giãn",duration:20,price:60000,status:"active",image:"/images/services/lay-ray-tai.svg"},
 {id:7,name:"Gội đầu xả",description:"Gội đầu kết hợp xả dưỡng tóc mềm mượt",duration:45,price:100000,status:"active",image:"/images/services/goi-dau-xa.svg"}
];
export const initialStaff=[
 {id:1,name:"Nguyễn Văn A",phone:"0901000001",specialty:"Cắt tóc",status:"active"},
 {id:2,name:"Trần Văn B",phone:"0901000002",specialty:"Massage",status:"active"},
 {id:3,name:"Lê Thị C",phone:"0901000003",specialty:"Chăm sóc da",status:"active"}
];
export const times=["08:00","09:00","10:00","11:00","13:30","14:30","15:30","16:30","17:30"];
export const getData=(key,fallback)=>JSON.parse(localStorage.getItem(key)||"null")??fallback;
export const saveData=(key,data)=>localStorage.setItem(key,JSON.stringify(data));
