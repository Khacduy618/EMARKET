**Actor Chính:**

1.  **Người Mua (Buyer)**

**Actor/Hệ Thống Phụ Trợ (Bên Ngoài):**

1.  **Cổng Thanh Toán (PaymentGateway)**

---

**Nhóm Use Case: Duyệt & Tìm kiếm Sản phẩm**

1.  **Use Case: Xem Trang Chủ**
    *   Actor: Người Mua
2.  **Use Case: Duyệt Danh Mục Sản Phẩm**
    *   Actor: Người Mua
3.  **Use Case: Tìm Kiếm Sản Phẩm**
    *   Actor: Người Mua
4.  **Use Case: Xem Chi Tiết Sản Phẩm**
    *   Actor: Người Mua
    *   *Quan hệ:* Thường được truy cập từ "Xem Trang Chủ", "Duyệt Danh Mục Sản Phẩm", "Tìm Kiếm Sản Phẩm", "Xem Trang Shop".
5.  **Use Case: Xem Trang Shop**
    *   Actor: Người Mua
    *   *Quan hệ:* Thường được truy cập từ "Xem Chi Tiết Sản Phẩm".

---

**Nhóm Use Case: Mua Hàng & Thanh Toán**

6.  **Use Case: Quản Lý Giỏ Hàng**
    *   Actor: Người Mua
    *   *Quan hệ `<<extend>>`*: Được mở rộng từ "Xem Chi Tiết Sản Phẩm" (qua hành động "Thêm vào giỏ hàng").
7.  **Use Case: Tiến Hành Đặt Hàng**
    *   Actor: Người Mua
    *   *Quan hệ:* Thường bắt đầu từ "Quản Lý Giỏ Hàng".
8.  **Use Case: Chọn Địa Chỉ Giao Hàng**
    *   Actor: Người Mua
    *   *Quan hệ `<<include>>`*: Được bao gồm bởi "Tiến Hành Đặt Hàng".
9.  **Use Case: Áp Dụng Voucher**
    *   Actor: Người Mua
    *   *Quan hệ `<<include>>`*: Được bao gồm bởi "Tiến Hành Đặt Hàng".
10. **Use Case: Chọn Phương Thức Thanh Toán**
    *   Actor: Người Mua
    *   *Quan hệ `<<include>>`*: Được bao gồm bởi "Tiến Hành Đặt Hàng".
11. **Use Case: Xác Nhận Đặt Hàng**
    *   Actor: Người Mua
    *   *Quan hệ `<<include>>`*: Được bao gồm bởi "Tiến Hành Đặt Hàng".
12. **Use Case: Thanh Toán Online**
    *   Actor: Người Mua
    *   *Quan hệ `<<extend>>`*: Mở rộng từ "Xác Nhận Đặt Hàng" (nếu người mua chọn phương thức thanh toán trực tuyến).
    *   *Tương tác với*: Cổng Thanh Toán.

---

**Nhóm Use Case: Đánh Giá**

13. **Use Case: Đánh Giá Sản Phẩm Đã Mua**
    *   Actor: Người Mua
    *   *Quan hệ `<<extend>>`*: Thường được thực hiện sau khi "Xem Chi Tiết Đơn Hàng" (và đơn hàng đã giao).
14. **Use Case: Đánh Giá Shop Đã Mua**
    *   Actor: Người Mua
    *   *Quan hệ `<<extend>>`*: Thường được thực hiện sau khi "Xem Chi Tiết Đơn Hàng" (và đơn hàng đã giao).

---

**Nhóm Use Case: Theo dõi Đơn Hàng**

15. **Use Case: Xem Lịch Sử Đơn Hàng**
    *   Actor: Người Mua
16. **Use Case: Xem Chi Tiết Đơn Hàng**
    *   Actor: Người Mua
    *   *Quan hệ `<<include>>`*: Được bao gồm bởi "Xem Lịch Sử Đơn Hàng".
17. **Use Case: Theo Dõi Trạng Thái Đơn Hàng**
    *   Actor: Người Mua
    *   *Quan hệ `<<include>>`*: Được bao gồm bởi "Xem Chi Tiết Đơn Hàng".
18. **Use Case: Yêu Cầu Hủy Đơn Hàng**
    *   Actor: Người Mua
    *   *Quan hệ `<<extend>>`*: Mở rộng từ "Xem Chi Tiết Đơn Hàng" (nếu trạng thái đơn hàng cho phép).

---

**Tóm tắt các mối quan hệ chính để bạn dễ hình dung khi vẽ:**

*   **Người Mua** là actor chính tương tác với tất cả các use case trên (trừ khi có ghi chú đặc biệt).
*   **Luồng Duyệt & Tìm kiếm:**
    *   Xem Trang Chủ / Duyệt Danh Mục / Tìm Kiếm SP  -> Xem Chi Tiết Sản Phẩm.
    *   Xem Chi Tiết Sản Phẩm -> Xem Trang Shop.
*   **Luồng Mua Hàng:**
    *   Xem Chi Tiết Sản Phẩm -> (Thêm vào giỏ) -> Quản Lý Giỏ Hàng.
    *   Quản Lý Giỏ Hàng -> Tiến Hành Đặt Hàng.
    *   Tiến Hành Đặt Hàng **BAO GỒM (`<<include>>`)**:
        *   Chọn Địa Chỉ Giao Hàng
        *   Áp Dụng Voucher
        *   Chọn Phương Thức Thanh Toán
        *   Xác Nhận Đặt Hàng
    *   Xác Nhận Đặt Hàng **CÓ THỂ MỞ RỘNG (`<<extend>>`)** bằng Thanh Toán Online.
    *   Thanh Toán Online tương tác với Cổng Thanh Toán.
*   **Luồng Đánh Giá:**
    *   Xem Chi Tiết Đơn Hàng (đã giao) **CÓ THỂ MỞ RỘNG (`<<extend>>`)** bằng:
        *   Đánh Giá Sản Phẩm Đã Mua
        *   Đánh Giá Shop Đã Mua
*   **Luồng Theo dõi Đơn Hàng:**
    *   Xem Lịch Sử Đơn Hàng **BAO GỒM (`<<include>>`)** Xem Chi Tiết Đơn Hàng.
    *   Xem Chi Tiết Đơn Hàng **BAO GỒM (`<<include>>`)** Theo Dõi Trạng Thái Đơn Hàng.
    *   Xem Chi Tiết Đơn Hàng **CÓ THỂ MỞ RỘNG (`<<extend>>`)** bằng Yêu Cầu Hủy Đơn Hàng.

Chúc bạn vẽ được sơ đồ ưng ý!
