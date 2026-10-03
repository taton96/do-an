// 4 dịch vụ chính của hệ thống.
// Các dịch vụ nhỏ được quản lý trong subServices của từng nhóm.
export const initialServices = [
  {
    id: 1,
    name: "Cắt tóc",
    description: "Tạo phong cách tóc gọn gàng, phù hợp khuôn mặt.",
    duration: 45,
    price: 100000,
    status: "active",
    active: true,
    image: "/images/services/cat-toc-3d.jpg",
    subServices: [{name:"Cắt tóc nam",price:100000},{name:"Cắt tóc nữ",price:120000},{name:"Tạo kiểu tóc",price:50000},{name:"Gội đầu thư giãn",price:60000}]
  },
  {
    id: 2,
    name: "Massage",
    description: "Thư giãn cơ thể, giảm căng thẳng và mệt mỏi.",
    duration: 60,
    price: 300000,
    status: "active",
    active: true,
    image: "/images/services/massage-3d.jpg",
    subServices: [{name:"Massage toàn thân",price:300000},{name:"Massage cổ vai gáy",price:180000},{name:"Massage chân",price:150000},{name:"Massage đá nóng",price:350000}]
  },
  {
    id: 3,
    name: "Chăm sóc da",
    description: "Chăm sóc làn da sạch khỏe, mềm mịn và tươi sáng.",
    duration: 60,
    price: 250000,
    status: "active",
    active: true,
    image: "/images/services/cham-soc-da-3d.jpg",
    subServices: [{name:"Làm sạch da",price:80000},{name:"Cấp ẩm",price:100000},{name:"Trị mụn",price:150000},{name:"Chống lão hóa",price:200000}]
  },
  {
    id: 4,
    name: "Chăm sóc sức khỏe",
    description: "Theo dõi sức khỏe cơ bản và tư vấn chăm sóc cơ thể.",
    duration: 30,
    price: 150000,
    status: "active",
    active: true,
    image: "/images/services/cham-soc-suc-khoe-3d.jpg",
    subServices: [{name:"Khám sức khỏe tổng quát",price:200000},{name:"Tư vấn dinh dưỡng",price:120000},{name:"Đo huyết áp",price:30000},{name:"Lấy ráy tai",price:50000},{name:"Thư giãn trị liệu",price:100000}]
  }
];

export const initialStaff = [
  { id: 1, name: "Nguyễn Văn A", phone: "0901000001", specialty: "Cắt tóc", status: "active" },
  { id: 2, name: "Trần Văn B", phone: "0901000002", specialty: "Massage", status: "active" },
  { id: 3, name: "Lê Thị C", phone: "0901000003", specialty: "Chăm sóc da", status: "active" }
];

export const times = ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "17:30"];
export const getData = (key, fallback) => JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
export const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
