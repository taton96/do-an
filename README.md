# Booking System - Multi Service + Employee Scheduling

Luồng hoàn chỉnh:
1. Khách đăng nhập/đăng ký.
2. Chọn một hoặc nhiều dịch vụ.
3. Chọn nhân viên.
4. Chọn ngày đã được xếp ca.
5. Chọn giờ trống trong ca.
6. Đặt lịch.
7. Lịch hẹn lưu MongoDB.
8. Admin có thể xếp ca theo ngày cho nhân viên và gán nhân viên cho lịch chưa xếp.
9. Nhân viên đăng nhập sẽ thấy các lịch được phân công từ MongoDB.

## Chạy backend
```bash
cd backend
npm install
npm start
```

## Chạy frontend
```bash
cd frontend
npm install
npm run dev
```

MongoDB mặc định: `mongodb://127.0.0.1:27017/booking_system`.
