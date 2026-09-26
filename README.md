# Booking System - 4 dịch vụ chính

## Công nghệ
- Frontend: ReactJS + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT + bcrypt

## 4 dịch vụ chính
1. Cắt tóc
   - Cắt tóc nam
   - Cắt tóc nữ
   - Tạo kiểu tóc
   - Gội đầu thư giãn
2. Massage
   - Massage toàn thân
   - Massage cổ vai gáy
   - Massage chân
   - Massage đá nóng
3. Chăm sóc da
   - Làm sạch da
   - Cấp ẩm
   - Trị mụn
   - Chống lão hóa
4. Chăm sóc sức khỏe
   - Khám sức khỏe tổng quát
   - Tư vấn dinh dưỡng
   - Đo huyết áp
   - Lấy ráy tai
   - Thư giãn trị liệu

Các mục trên được lưu trong trường `subServices` của dịch vụ chính, không tạo thành các dịch vụ chính riêng.

## Hình ảnh
Giao diện sử dụng bộ ảnh minh họa 3D cho 4 nhóm dịch vụ và ảnh tổng quan 4 nhóm trên trang chủ.

## Chạy dự án
### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tài khoản mẫu
- Admin: admin@gmail.com / 123456
- Employee: employee1@gmail.com / 123456
