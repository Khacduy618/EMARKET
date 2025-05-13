**A. Khách Truy Cập (Guest User - Chưa đăng nhập)**

1.  **UC-GUEST-001: Xem Trang Chủ**
    *   **Mô tả:** Người dùng truy cập trang chủ của website.
    *   **Luồng chính:**
        1.  Người dùng mở trình duyệt và nhập URL của website.
        2.  Hệ thống hiển thị trang chủ với:
            *   Banner quảng cáo (`Banners`). (có thể có hoặc không)
            *   Các sản phẩm nổi bật/mới/bán chạy (lấy từ `Products`).
            *   Danh sách các danh mục chính (`PlatformCategories`).
            *   Thanh tìm kiếm.
            *   Nút "Đăng nhập", "Đăng ký".

2.  **UC-GUEST-002: Duyệt Danh Mục Sản Phẩm**
    *   **Mô tả:** Người dùng xem các sản phẩm theo danh mục.
    *   **Luồng chính:**
        1.  Người dùng nhấp vào một danh mục trên trang chủ hoặc menu danh mục.
        2.  Hệ thống hiển thị trang danh mục với danh sách các sản phẩm (`Products`) thuộc danh mục đó (và các danh mục con nếu có).
        3.  Người dùng có thể xem phân trang sản phẩm.
        4.  Người dùng có thể nhấp vào danh mục con để xem chi tiết hơn.
    *   **Luồng thay thế (Lọc/Sắp xếp):**
        *   Người dùng áp dụng bộ lọc (giá, đánh giá, shop - nếu có).
        *   Người dùng chọn tiêu chí sắp xếp (giá, tên, mới nhất).
        *   Hệ thống cập nhật danh sách sản phẩm theo bộ lọc/sắp xếp.

3.  **UC-GUEST-003: Tìm Kiếm Sản Phẩm**
    *   **Mô tả:** Người dùng tìm kiếm sản phẩm bằng từ khóa.
    *   **Luồng chính:**
        1.  Người dùng nhập từ khóa vào ô tìm kiếm và nhấn Enter hoặc nút tìm kiếm.
        2.  Hệ thống hiển thị trang kết quả tìm kiếm với danh sách các sản phẩm (`Products`) phù hợp.
        3.  Người dùng có thể áp dụng Lọc/Sắp xếp (như UC-GUEST-002).

4.  **UC-GUEST-004: Xem Chi Tiết Sản Phẩm**
    *   **Mô tả:** Người dùng xem thông tin chi tiết của một sản phẩm.
    *   **Luồng chính:**
        1.  Người dùng nhấp vào một sản phẩm từ trang danh sách/kết quả tìm kiếm/trang chủ.
        2.  Hệ thống hiển thị trang chi tiết sản phẩm với:
            *   Tên, mô tả, SKU, giá (`Products`).
            *   Hình ảnh sản phẩm, ảnh chính, ảnh phụ (`ProductImages`).
            *   Thông tin Shop bán (`Shops.ShopName`, link tới trang shop).
            *   Đánh giá trung bình, số lượt đánh giá (`Products.AverageRating`, `ProductReviews`).
            *   Số lượng tồn kho (nếu hiển thị).
            *   Nút "Thêm vào giỏ hàng" (có thể yêu cầu đăng nhập).
            *   Danh sách đánh giá chi tiết từ người mua khác (`ProductReviews`).

5.  **UC-GUEST-005: Xem Trang Shop (Gian Hàng)**
    *   **Mô tả:** Người dùng xem thông tin và sản phẩm của một Shop cụ thể.
    *   **Luồng chính:**
        1.  Người dùng nhấp vào tên Shop từ trang chi tiết sản phẩm hoặc danh sách Shop (nếu có).
        2.  Hệ thống hiển thị trang của Shop với:
            *   Thông tin Shop: Tên, logo, ảnh bìa, mô tả, địa chỉ (`Shops`).
            *   Danh sách sản phẩm của Shop đó (`Products` lọc theo `ShopID`).
            *   Đánh giá về Shop (`ShopReviews`).

6.  **UC-GUEST-006: Đăng Ký Tài Khoản Mới**
    *   **Mô tả:** Người dùng tạo tài khoản mới trên hệ thống.
    *   **Luồng chính:**
        1.  Người dùng nhấp nút "Đăng ký".
        2.  Hệ thống hiển thị form đăng ký.
        3.  Người dùng nhập: Username, Email, Mật khẩu, Xác nhận mật khẩu, Họ tên, SĐT (`Users`).
        4.  Người dùng đồng ý với điều khoản.
        5.  Người dùng nhấn "Đăng ký".
        6.  Hệ thống tạo tài khoản mới (mặc định `Role`='Buyer', `IsActive`=TRUE), lưu `PasswordHash`.
        7.  Hệ thống có thể gửi email xác thực (tùy chọn).
        8.  Chuyển hướng đến trang đăng nhập hoặc trang chủ (đã đăng nhập).

7.  **UC-GUEST-007: Đăng Nhập Vào Hệ Thống**
    *   **Mô tả:** Người dùng đăng nhập bằng tài khoản đã có.
    *   **Luồng chính:**
        1.  Người dùng nhấp nút "Đăng nhập".
        2.  Hệ thống hiển thị form đăng nhập.
        3.  Người dùng nhập Username (hoặc Email) và Mật khẩu (`Users`).
        4.  Người dùng nhấn "Đăng nhập".
        5.  Hệ thống xác thực thông tin. Nếu thành công, tạo session và chuyển hướng đến trang chủ (đã đăng nhập) hoặc trang trước đó.
    *   **Luồng thay thế (Đăng nhập thất bại):**
        *   Hệ thống hiển thị thông báo lỗi.

8.  **UC-GUEST-008: Yêu Cầu Đặt Lại Mật Khẩu**
    *   **Mô tả:** Người dùng quên mật khẩu và muốn đặt lại.
    *   **Luồng chính:**
        1.  Người dùng nhấp link "Quên mật khẩu" trên form đăng nhập.
        2.  Hệ thống hiển thị form yêu cầu đặt lại mật khẩu.
        3.  Người dùng nhập Email đã đăng ký (`Users.Email`).
        4.  Hệ thống gửi email chứa link/mã xác nhận để đặt lại mật khẩu.
        5.  Người dùng kiểm tra email, nhấp vào link hoặc nhập mã.
        6.  Hệ thống hiển thị form đặt lại mật khẩu mới.
        7.  Người dùng nhập mật khẩu mới và xác nhận.
        8.  Hệ thống cập nhật `PasswordHash` cho user.
        9.  Thông báo thành công, chuyển hướng đến trang đăng nhập.

---

**B. Người Mua (Buyer - Đã đăng nhập)**

*   *(Bao gồm tất cả use case của Khách Truy Cập, với trải nghiệm đã đăng nhập)*

1.  **UC-BUYER-001: Quản Lý Thông Tin Cá Nhân**
    *   **Mô tả:** Người mua xem và cập nhật thông tin tài khoản của mình.
    *   **Luồng chính:**
        1.  Người mua truy cập trang "Tài khoản của tôi".
        2.  Hệ thống hiển thị thông tin: Họ tên, Email, SĐT (`Users`).
        3.  Người mua có thể chỉnh sửa Họ tên, SĐT và lưu lại.
        4.  Người mua có thể chọn "Thay đổi mật khẩu" để vào form thay đổi mật khẩu (nhập mật khẩu cũ, mật khẩu mới, xác nhận).

2.  **UC-BUYER-002: Quản Lý Sổ Địa Chỉ Giao Hàng**
    *   **Mô tả:** Người mua quản lý danh sách địa chỉ giao hàng.
    *   **Luồng chính:**
        1.  Người mua truy cập mục "Sổ địa chỉ" trong tài khoản.
        2.  Hệ thống hiển thị danh sách địa chỉ đã lưu (`Addresses` của `UserID` đó).
        3.  **Thêm địa chỉ mới:**
            *   Người mua nhấp "Thêm địa chỉ mới".
            *   Điền form: Họ tên người nhận, SĐT, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố.
            *   Chọn "Đặt làm mặc định" (nếu muốn).
            *   Lưu lại.
        4.  **Sửa địa chỉ:** Nhấp "Sửa" tại một địa chỉ, cập nhật thông tin, lưu lại.
        5.  **Xóa địa chỉ:** Nhấp "Xóa" tại một địa chỉ, xác nhận.
        6.  **Đặt làm mặc định:** Chọn một địa chỉ và nhấp "Đặt làm mặc định". Hệ thống cập nhật `Users.DefaultShippingAddressID` và `Addresses.IsDefault`.

3.  **UC-BUYER-003: Quản Lý Giỏ Hàng**
    *   **Mô tả:** Người mua thêm, xem, sửa, xóa sản phẩm trong giỏ hàng.
    *   **Luồng chính:**
        1.  **Thêm vào giỏ:** Từ trang chi tiết sản phẩm, người mua chọn số lượng (nếu có biến thể thì chọn biến thể) và nhấp "Thêm vào giỏ hàng". Hệ thống tạo/cập nhật `CartItems` cho `Carts` của user.
        2.  **Xem giỏ hàng:** Người mua nhấp vào icon giỏ hàng.
        3.  Hệ thống hiển thị trang giỏ hàng với:
            *   Danh sách sản phẩm (`CartItems` join `Products`, `Shops`).
            *   Thông tin từng sản phẩm: ảnh, tên, giá, số lượng, thành tiền.
            *   Phân nhóm sản phẩm theo Shop (`CartItems.ShopID`).
            *   Tổng tiền tạm tính cho mỗi Shop.
            *   Tổng tiền tạm tính của toàn bộ giỏ hàng.
        4.  **Cập nhật số lượng:** Người mua thay đổi số lượng sản phẩm, hệ thống cập nhật `CartItems.Quantity` và tính lại tiền.
        5.  **Xóa sản phẩm:** Người mua nhấp nút xóa một sản phẩm, hệ thống xóa `CartItems` tương ứng.
        6.  Nhấp "Tiến hành đặt hàng".

4.  **UC-BUYER-004: Tiến Hành Đặt Hàng Và Thanh Toán**
    *   **Mô tả:** Người mua hoàn tất quá trình đặt hàng và chọn phương thức thanh toán.
    *   **Luồng chính:**
        1.  Từ trang giỏ hàng, người mua nhấp "Tiến hành đặt hàng".
        2.  **Bước 1: Địa chỉ giao hàng:**
            *   Hệ thống hiển thị địa chỉ mặc định (`Users.DefaultShippingAddressID` join `Addresses`).
            *   Người mua có thể chọn địa chỉ khác từ sổ địa chỉ hoặc thêm địa chỉ mới.
        3.  **Bước 2: Xem lại đơn hàng và Voucher:**
            *   Hệ thống hiển thị lại danh sách sản phẩm, số lượng, giá, tổng tiền cho từng Shop, phí vận chuyển dự kiến cho từng shop (nếu có).
            *   Người mua có thể nhập/chọn Voucher của Shop (`Vouchers` có `Scope`='Shop') cho từng phần đơn hàng của Shop. Hệ thống tính lại `ShopDiscountAmount`, `TotalAmountForShop`.
            *   Người mua có thể nhập/chọn Voucher của Sàn (`Vouchers` có `Scope`='Platform'). Hệ thống tính lại `PlatformDiscountAmount`.
            *   Hiển thị tổng tiền cuối cùng của đơn hàng (`Orders_Buyer.TotalAmount`).
        4.  **Bước 3: Chọn Phương Thức Thanh Toán:**
            *   Người mua chọn một trong các phương thức (`Orders_Buyer.PaymentMethod`): COD, Chuyển khoản ngân hàng, Cổng thanh toán trực tuyến.
        5.  **Bước 4: Xác Nhận Đơn Hàng:**
            *   Người mua nhấp "Đặt Hàng".
            *   Hệ thống:
                *   Tạo một bản ghi `Orders_Buyer` (lưu địa chỉ giao hàng đã snapshot, `PaymentStatus`='Pending').
                *   Tạo các bản ghi `ShopOrders` tương ứng với mỗi shop có sản phẩm trong giỏ (liên kết với `Orders_Buyer.OrderID`, lưu `ShopOrderStatus`='PendingConfirmation').
                *   Tạo các bản ghi `OrderItems` cho mỗi sản phẩm trong từng `ShopOrders` (lưu `PriceAtPurchase`).
                *   Cập nhật `Vouchers.TimesUsed`, tạo `UserUsedVouchers` nếu có voucher được áp dụng.
                *   Giảm `Products.StockQuantity`, Xóa `CartItems` khỏi `Carts`.
                *   Hiển thị trang xác nhận đơn hàng thành công với `Orders_Buyer.OrderCode`.
        6.  **Luồng con (Thanh toán Online):**
            *   Nếu chọn "Cổng thanh toán trực tuyến":
                *   Hệ thống chuyển hướng người dùng đến trang của cổng thanh toán với thông tin đơn hàng.
                *   Người dùng thực hiện thanh toán trên trang cổng thanh toán.
                *   Cổng thanh toán thông báo kết quả về cho website (callback/redirect).
                *   Hệ thống cập nhật `Orders_Buyer.PaymentStatus` ('Paid' hoặc 'Failed').

5.  **UC-BUYER-005: Theo Dõi Lịch Sử Và Trạng Thái Đơn Hàng**
    *   **Mô tả:** Người mua xem các đơn hàng đã đặt và trạng thái của chúng.
    *   **Luồng chính:**
        1.  Người mua truy cập mục "Đơn hàng của tôi".
        2.  Hệ thống hiển thị danh sách các `Orders_Buyer` đã đặt, sắp xếp theo ngày mới nhất. Mỗi đơn hàng hiển thị `OrderCode`, Ngày đặt, Tổng tiền, `OverallStatus`.
        3.  Người mua nhấp vào một đơn hàng để xem chi tiết:
            *   Thông tin người nhận, địa chỉ giao hàng.
            *   Danh sách các `ShopOrders` trong đơn hàng đó, mỗi `ShopOrder` có `ShopOrderCode`, tên Shop, `ShopOrderStatus`, `TrackingNumber`, `ShippingProvider`.
            *   Danh sách các `OrderItems` trong mỗi `ShopOrder`.

6.  **UC-BUYER-006: Yêu Cầu Hủy Đơn Hàng (Phần của Shop)**
    *   **Mô tả:** Người mua yêu cầu hủy một phần đơn hàng (thuộc về một Shop) nếu trạng thái cho phép.
    *   **Luồng chính:**
        1.  Từ trang chi tiết đơn hàng, nếu `ShopOrders.ShopOrderStatus` cho phép hủy (ví dụ: 'PendingConfirmation', 'Processing').
        2.  Người mua nhấp nút "Hủy đơn hàng này" (cho `ShopOrder` đó).
        3.  Hệ thống cập nhật `ShopOrders.ShopOrderStatus` = 'CancelledByBuyer' (hoặc trạng thái chờ Seller xác nhận hủy).
        4.  Cập nhật lại `Orders_Buyer.OverallStatus` nếu cần.
        5.  Logic hoàn tiền (nếu đã thanh toán online) được kích hoạt (có thể phức tạp, cần quy trình riêng).

7.  **UC-BUYER-007: Đánh Giá Sản Phẩm Đã Mua**
    *   **Mô tả:** Người mua viết đánh giá cho sản phẩm sau khi đã nhận hàng.
    *   **Luồng chính:**
        1.  Từ trang chi tiết đơn hàng (sau khi `ShopOrders.ShopOrderStatus` = 'Delivered') hoặc từ danh sách "Sản phẩm chờ đánh giá".
        2.  Người mua chọn sản phẩm muốn đánh giá.
        3.  Hệ thống hiển thị form đánh giá:
            *   Chọn số sao (Rating 1-5).
            *   Viết bình luận (Comment).
            *   Tải lên hình ảnh review (`ReviewImages` - JSON).
        4.  Người mua gửi đánh giá.
        5.  Hệ thống tạo bản ghi `ProductReviews` (liên kết với `ProductID`, `UserID_Buyer`, `ShopOrderID`, `IsApproved` có thể là TRUE hoặc chờ Admin duyệt).
        6.  Cập nhật `Products.AverageRating`.

8.  **UC-BUYER-008: Đánh Giá Shop Đã Mua**
    *   **Mô tả:** Người mua viết đánh giá cho Shop sau khi đã giao dịch.
    *   **Luồng chính:** (Tương tự UC-BUYER-007 nhưng cho Shop)
        1.  Từ trang chi tiết đơn hàng (sau khi `ShopOrders.ShopOrderStatus` = 'Delivered').
        2.  Người mua chọn "Đánh giá Shop".
        3.  Hệ thống hiển thị form: Chọn số sao, viết bình luận.
        4.  Hệ thống tạo bản ghi `ShopReviews` (liên kết với `ShopID`, `UserID_Buyer`, `ShopOrderID`).
        5.  Cập nhật `Shops.AverageRating`.

9.  **UC-BUYER-009: Chat Với Người Bán/Shop**
    *   **Mô tả:** Người mua trò chuyện trực tiếp với Shop.
    *   **Luồng chính:**
        1.  Từ trang chi tiết sản phẩm hoặc trang Shop, người mua nhấp nút "Chat với Shop".
        2.  Hệ thống mở giao diện chat, tạo/mở `Conversations` giữa `UserID_Buyer` và `Shops.UserID_Owner`.
        3.  Người mua nhập tin nhắn (`ChatMessages.MessageContent`) và gửi.
        4.  Hệ thống lưu tin nhắn, hiển thị trong cuộc trò chuyện.
        5.  Người mua nhận được tin nhắn từ Shop.
        6.  Xem danh sách các cuộc trò chuyện, thông báo tin nhắn mới.

10. **UC-BUYER-010: Theo Dõi Shop Yêu Thích**
    *   **Mô tả:** Người mua theo dõi các Shop để nhận cập nhật.
    *   **Luồng chính:**
        1.  Trên trang Shop, người mua nhấp nút "Theo dõi".
        2.  Hệ thống tạo bản ghi `ShopFollows`.
        3.  Người mua có thể xem danh sách các Shop đã theo dõi trong tài khoản.
        4.  Bỏ theo dõi: Nhấp nút "Bỏ theo dõi". Hệ thống xóa bản ghi `ShopFollows`.

11. **UC-BUYER-011: Xem và Lưu Voucher**
    *   **Mô tả:** Người mua xem các voucher có sẵn và lưu về tài khoản (nếu có tính năng "ví voucher").
    *   **Luồng chính:**
        1.  Người mua truy cập trang "Mã giảm giá" hoặc xem voucher trên trang sản phẩm/shop/banner.
        2.  Hệ thống hiển thị danh sách `Vouchers` hợp lệ.
        3.  Người mua có thể nhấp "Lưu" để thêm voucher vào danh sách cá nhân (tùy chọn, có thể không cần bảng riêng, chỉ cần ghi nhớ khi thanh toán).

12. **UC-BUYER-012: Đăng Xuất**
    *   **Mô tả:** Người mua thoát khỏi tài khoản.
    *   **Luồng chính:**
        1.  Người mua nhấp nút "Đăng xuất".
        2.  Hệ thống hủy session, chuyển hướng về trang chủ.

---

**C. Người Bán (Seller - Chủ Shop, đã đăng nhập)**

1.  **UC-SELLER-001: Đăng Ký Mở Shop Mới (Nếu User chưa có Shop)**
    *   **Mô tả:** Người dùng có vai trò Buyer muốn trở thành Seller.
    *   **Luồng chính:**
        1.  Người dùng (đã đăng nhập với vai trò Buyer) tìm đến mục "Mở Shop" hoặc "Trở thành Người Bán".
        2.  Hệ thống hiển thị form đăng ký Shop.
        3.  Người dùng điền thông tin: Tên Shop, Mô tả, Logo, Ảnh bìa, Địa chỉ lấy hàng, SĐT Shop (`Shops`).
        4.  Người dùng gửi yêu cầu.
        5.  Hệ thống tạo bản ghi `Shops` với `UserID_Owner` là `UserID` của người dùng, `Status`='PendingApproval'.
        6.  Có thể cập nhật `Users.Role` (nếu cần, hoặc vai trò Seller được suy ra từ việc sở hữu Shop).
        7.  Thông báo yêu cầu đã được gửi và chờ duyệt.

2.  **UC-SELLER-002: Quản Lý Thông Tin Shop**
    *   **Mô tả:** Seller cập nhật thông tin gian hàng của mình.
    *   **Luồng chính:**
        1.  Seller truy cập trang quản lý Shop.
        2.  Hệ thống hiển thị thông tin Shop hiện tại (`Shops`).
        3.  Seller có thể chỉnh sửa: Tên Shop, Mô tả, Logo, Ảnh bìa, Địa chỉ, SĐT.
        4.  Lưu thay đổi. Hệ thống cập nhật bản ghi `Shops`.
        5.  Xem trạng thái Shop (`Shops.Status`).

3.  **UC-SELLER-003: Xem Đánh Giá Về Shop Của Mình**
    *   **Mô tả:** Seller xem các đánh giá mà người mua đã viết về Shop.
    *   **Luồng chính:**
        1.  Seller vào mục "Đánh giá Shop" trong trang quản lý.
        2.  Hệ thống hiển thị danh sách các `ShopReviews` liên quan đến `ShopID` của Seller.

4.  **UC-SELLER-004: Đăng Tải Và Quản Lý Sản Phẩm**
    *   **Mô tả:** Seller thêm mới, sửa, xóa sản phẩm trong gian hàng.
    *   **Luồng chính (Thêm mới):**
        1.  Seller vào mục "Quản lý Sản phẩm", chọn "Thêm Sản phẩm mới".
        2.  Hệ thống hiển thị form thêm sản phẩm.
        3.  Seller điền thông tin: Tên, Mô tả, SKU, Giá, Số lượng tồn, chọn Danh mục (`PlatformCategories`).
        4.  Tải lên hình ảnh sản phẩm (`ProductImages`, chọn ảnh chính).
        5.  Gửi sản phẩm.
        6.  Hệ thống tạo bản ghi `Products` (liên kết `ShopID`, `CategoryID`), `AdminApprovalStatus`='Pending' (hoặc 'Approved' nếu không cần duyệt). Tạo các bản ghi `ProductImages`.
    *   **Luồng chính (Sửa/Xóa):**
        1.  Seller xem danh sách sản phẩm của Shop.
        2.  Chọn "Sửa" để cập nhật thông tin sản phẩm, hình ảnh.
        3.  Chọn "Xóa" để xóa sản phẩm (cần kiểm tra ràng buộc với `OrderItems`).
        4.  Cập nhật `IsActive` để ẩn/hiện sản phẩm.

5.  **UC-SELLER-005: Xem Trạng Thái Duyệt Sản Phẩm**
    *   **Mô tả:** Seller theo dõi trạng thái duyệt sản phẩm từ Admin.
    *   **Luồng chính:**
        1.  Trong danh sách sản phẩm, Seller thấy cột `Products.AdminApprovalStatus` (Pending, Approved, Rejected) và `ReasonForRejection` (nếu có).

6.  **UC-SELLER-006: Quản Lý Đơn Hàng Của Shop**
    *   **Mô tả:** Seller xử lý các đơn hàng thuộc về Shop của mình.
    *   **Luồng chính:**
        1.  Seller vào mục "Quản lý Đơn hàng".
        2.  Hệ thống hiển thị danh sách các `ShopOrders` của Shop, lọc theo trạng thái (Mới, Đang xử lý, ...).
        3.  Với đơn hàng mới (`ShopOrderStatus`='PendingConfirmation'):
            *   Seller xem chi tiết đơn hàng (`OrderItems`).
            *   Seller "Xác nhận đơn hàng" -> `ShopOrderStatus`='Processing'.
        4.  Với đơn hàng đang xử lý (`ShopOrderStatus`='Processing'):
            *   Seller chuẩn bị hàng, "Sẵn sàng giao" -> `ShopOrderStatus`='ReadyToShip'.
        5.  Với đơn hàng sẵn sàng giao (`ShopOrderStatus`='ReadyToShip'):
            *   Seller bàn giao cho đơn vị vận chuyển, nhập `TrackingNumber`, `ShippingProvider`, `EstimatedDeliveryDate`.
            *   Seller cập nhật "Đã giao hàng" (cho ĐVVC) -> `ShopOrderStatus`='Shipped'.
        6.  Seller có thể "Hủy đơn hàng" (`ShopOrderStatus`='CancelledBySeller') nếu có lý do chính đáng (hết hàng, không liên lạc được người mua) và trạng thái cho phép.
        7.  Xem các yêu cầu hủy từ người mua và xử lý.

7.  **UC-SELLER-007: Tạo Và Quản Lý Voucher Của Shop**
    *   **Mô tả:** Seller tạo mã giảm giá riêng cho Shop của mình.
    *   **Luồng chính (Tạo mới):**
        1.  Seller vào mục "Quản lý Voucher", chọn "Tạo Voucher mới".
        2.  Điền thông tin: Mã Code, Mô tả, Loại giảm giá (Percentage, FixedAmount), Giá trị giảm, Giá trị tối đa (cho Percentage), Đơn hàng tối thiểu, Ngày bắt đầu/kết thúc, Giới hạn sử dụng (cho user, tổng cộng). `Scope`='Shop', `ShopID` là của Seller.
        3.  Lưu voucher. Hệ thống tạo bản ghi `Vouchers`.
    *   **Luồng chính (Quản lý):**
        1.  Xem danh sách voucher đã tạo, số lần đã sử dụng (`TimesUsed`).
        2.  Chỉnh sửa, vô hiệu hóa (`IsActive`=FALSE) voucher.

8.  **UC-SELLER-008: Chat Với Người Mua**
    *   **Mô tả:** Seller tương tác với khách hàng qua chat.
    *   **Luồng chính:** (Tương tự UC-BUYER-009, nhưng từ phía Seller)
        1.  Seller nhận thông báo có tin nhắn mới.
        2.  Truy cập giao diện chat, xem danh sách `Conversations`.
        3.  Trả lời tin nhắn, gửi thông tin sản phẩm/đơn hàng.

9.  **UC-SELLER-009: Xem Thống Kê Bán Hàng Cơ Bản**
    *   **Mô tả:** Seller xem các số liệu về hoạt động kinh doanh.
    *   **Luồng chính:**
        1.  Seller vào mục "Thống kê" hoặc "Báo cáo".
        2.  Hệ thống hiển thị các số liệu: Doanh thu (từ `ShopOrders.TotalAmountForShop` đã hoàn thành), số lượng đơn hàng, sản phẩm bán chạy. Có thể lọc theo thời gian.

10. **UC-SELLER-010: Đăng Xuất** (Tương tự UC-BUYER-012)

---

**D. Quản Trị Viên (Admin - Đã đăng nhập)**

1.  **UC-ADMIN-001: Quản Lý Tài Khoản Người Dùng**
    *   **Mô tả:** Admin quản lý tất cả tài khoản trên hệ thống.
    *   **Luồng chính:**
        1.  Admin truy cập mục "Quản lý Người dùng".
        2.  Hệ thống hiển thị danh sách `Users` với thông tin cơ bản và `Role`, `IsActive`.
        3.  Admin có thể:
            *   Tìm kiếm/lọc user.
            *   Xem chi tiết user.
            *   Thay đổi `Role` (cẩn trọng).
            *   Thay đổi `IsActive` (khóa/mở khóa tài khoản).

2.  **UC-ADMIN-002: Quản Lý Các Shop**
    *   **Mô tả:** Admin duyệt và quản lý các gian hàng.
    *   **Luồng chính:**
        1.  Admin truy cập "Quản lý Shop".
        2.  Hiển thị danh sách `Shops`, lọc theo `Status`.
        3.  **Duyệt Shop mới:** Với Shop có `Status`='PendingApproval', Admin xem thông tin, chọn "Duyệt" (`Status`='Approved') hoặc "Từ chối" (`Status`='Rejected').
        4.  **Quản lý Shop đang hoạt động:** Khóa (`Status`='Suspended') hoặc mở lại Shop.

3.  **UC-ADMIN-003: Quản Lý Danh Mục Sản Phẩm Toàn Sàn**
    *   **Mô tả:** Admin quản lý cấu trúc danh mục sản phẩm.
    *   **Luồng chính:**
        1.  Admin truy cập "Quản lý Danh mục".
        2.  Hiển thị cây danh mục `PlatformCategories`.
        3.  Admin có thể: Thêm danh mục mới (chọn danh mục cha nếu là con), sửa tên/mô tả/ảnh/slug, thay đổi `IsActive`, xóa danh mục (cẩn trọng nếu có sản phẩm).

4.  **UC-ADMIN-004: Quản Lý Sản Phẩm Toàn Sàn**
    *   **Mô tả:** Admin duyệt sản phẩm do Seller đăng và quản lý sản phẩm vi phạm.
    *   **Luồng chính:**
        1.  Admin truy cập "Quản lý Sản phẩm".
        2.  Hiển thị danh sách tất cả `Products`, lọc theo `AdminApprovalStatus`.
        3.  **Duyệt sản phẩm mới:** Với sản phẩm `AdminApprovalStatus`='Pending', Admin xem chi tiết, chọn "Duyệt" (`AdminApprovalStatus`='Approved') hoặc "Từ chối" (`AdminApprovalStatus`='Rejected', nhập `ReasonForRejection`).
        4.  **Quản lý sản phẩm vi phạm:** Gỡ sản phẩm (cập nhật `Products.IsActive`=FALSE hoặc xóa hẳn nếu cần).

5.  **UC-ADMIN-005: Giám Sát Và Quản Lý Đơn Hàng**
    *   **Mô tả:** Admin xem tổng quan và can thiệp vào đơn hàng khi cần thiết.
    *   **Luồng chính:**
        1.  Admin truy cập "Quản lý Đơn hàng".
        2.  Hiển thị danh sách tất cả `Orders_Buyer` và `ShopOrders`.
        3.  Admin có thể xem chi tiết, tìm kiếm/lọc đơn hàng.
        4.  Can thiệp vào trạng thái đơn hàng trong trường hợp tranh chấp, cập nhật `PaymentStatus` thủ công (nếu cần).

6.  **UC-ADMIN-006: Quản Lý Đánh Giá (Sản phẩm, Shop)**
    *   **Mô tả:** Admin kiểm duyệt các đánh giá.
    *   **Luồng chính:**
        1.  Admin vào "Quản lý Đánh giá Sản phẩm" hoặc "Quản lý Đánh giá Shop".
        2.  Hiển thị danh sách `ProductReviews` hoặc `ShopReviews`, có thể lọc theo `IsApproved`.
        3.  Admin xem nội dung đánh giá, chọn "Duyệt" (`IsApproved`=TRUE) hoặc "Ẩn/Xóa" (`IsApproved`=FALSE hoặc xóa bản ghi) nếu vi phạm.

7.  **UC-ADMIN-007: Quản Lý Voucher Toàn Sàn**
    *   **Mô tả:** Admin tạo và quản lý các chương trình khuyến mãi của sàn.
    *   **Luồng chính:** (Tương tự UC-SELLER-007 nhưng `Scope`='Platform', không có `ShopID`)
        1.  Tạo voucher mới với các điều kiện áp dụng cho toàn sàn.
        2.  Quản lý danh sách voucher của sàn.

8.  **UC-ADMIN-008: Quản Lý Banner Quảng Cáo**
    *   **Mô tả:** Admin quản lý các banner hiển thị trên website.
    *   **Luồng chính:**
        1.  Admin vào "Quản lý Banner".
        2.  Hiển thị danh sách `Banners`.
        3.  Thêm banner mới (Tiêu đề, Ảnh, Link, Vị trí, Thứ tự, Thời gian hiển thị, `IsActive`).
        4.  Sửa, xóa, thay đổi trạng thái banner.

9.  **UC-ADMIN-009: Quản Lý Cài Đặt Chung Của Website**
    *   **Mô tả:** Admin cấu hình các thông số hoạt động của sàn.
    *   **Luồng chính:**
        1.  Admin vào "Cài đặt Website".
        2.  Hiển thị danh sách các `SiteSettings` (SettingKey, SettingValue, Description).
        3.  Admin cập nhật `SettingValue` cho các key (ví dụ: tên website, email admin, % hoa hồng cho shop - nếu có).

10. **UC-ADMIN-010: Xem Báo Cáo Thống Kê Toàn Sàn**
    *   **Mô tả:** Admin xem các số liệu tổng quan về hoạt động của sàn TMĐT.
    *   **Luồng chính:**
        1.  Admin vào mục "Báo cáo" hoặc "Dashboard".
        2.  Hệ thống hiển thị các biểu đồ, số liệu: Tổng doanh thu, số lượng đơn hàng, người dùng mới, shop mới, sản phẩm bán chạy nhất, v.v.

11. **UC-ADMIN-011: Đăng Xuất** (Tương tự UC-BUYER-012)

---
