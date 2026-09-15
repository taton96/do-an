import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getData, saveData } from "../data";


// Tên hiển thị của trạng thái
const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy"
};


export default function MyBookings() {

  const { user } = useAuth();


  // Lấy danh sách lịch đặt của khách hàng hiện tại
  const [list, setList] = useState(() => {

    const bookings = getData("bookings", []);

    return bookings.filter(
      (booking) => booking.customerId === user.id
    );
  });


  // Hủy lịch đặt
  function cancel(id) {

    const bookings = getData("bookings", []);


    const updatedBookings = bookings.map(
      (booking) => {

        if (booking.id === id) {
          return {
            ...booking,
            status: "cancelled"
          };
        }

        return booking;
      }
    );


    // Lưu dữ liệu mới
    saveData("bookings", updatedBookings);


    // Cập nhật lại danh sách trên màn hình
    setList(
      updatedBookings.filter(
        (booking) => booking.customerId === user.id
      )
    );
  }


  return (
    <main className="container page">

      {/* Tiêu đề */}
      <h1>
        Lịch đặt của tôi
      </h1>


      {/* Không có lịch đặt */}
      {!list.length ? (

        <div className="empty">
          Bạn chưa có lịch đặt nào.
        </div>

      ) : (

        /* Có lịch đặt */
        <div className="tablewrap">

          <table>

            {/* Tiêu đề bảng */}
            <thead>

              <tr>
                <th>Dịch vụ</th>
                <th>Nhân viên</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>

            </thead>


            {/* Nội dung bảng */}
            <tbody>

              {list
                .sort((a, b) => b.id - a.id)
                .map((booking) => (

                  <tr key={booking.id}>

                    {/* Dịch vụ */}
                    <td>
                      {booking.serviceName}
                    </td>


                    {/* Nhân viên */}
                    <td>
                      {booking.staffName}
                    </td>


                    {/* Ngày */}
                    <td>
                      {booking.date}
                    </td>


                    {/* Giờ */}
                    <td>
                      {booking.time}
                    </td>


                    {/* Trạng thái */}
                    <td>

                      <span
                        className={`status ${booking.status}`}
                      >
                        {labels[booking.status]}
                      </span>

                    </td>


                    {/* Nút hủy */}
                    <td>

                      {![
                        "completed",
                        "cancelled"
                      ].includes(booking.status) && (

                        <button
                          className="danger"
                          onClick={() => cancel(booking.id)}
                        >
                          Hủy
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>
      )}

    </main>
  );
}
