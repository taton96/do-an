# Booking Service Frontend

## Chạy dự án
```bash
npm install
npm run dev
```

Mở http://localhost:5173/

## Tài khoản demo
- Admin: admin@gmail.com / 123456
- Staff: staff@gmail.com / 123456
- Customer: customer@gmail.com / 123456

## Chức năng
- Trang chủ, dịch vụ, tìm kiếm
- Đăng ký/đăng nhập/đăng xuất, phân quyền
- Khách: đặt lịch, chống trùng giờ, xem/hủy lịch
- Nhân viên: xem lịch, xác nhận, hoàn thành
- Admin: dashboard, CRUD dịch vụ, CRUD nhân viên, quản lý lịch, ca làm/ngày nghỉ
- Dữ liệu demo lưu localStorage để chạy ngay.
- `src/api.js` đã chuẩn bị Axios với API mặc định http://localhost:3000/api để nối backend sau.
