# EMARKET
Website thương mại điện tử EMARKET 
Thêm côt discount type int  vào products trong db
discount 	int  3 nằm sau price
Them thu vien chay slide FE 
clear docker build lai docker
pnpm add swiper
//////
Anh em pull về nhớ là máy phải có nodejs, pnpm
Sau khi có 2 cái đó thì anh em mở terminal và nhập "pnpm i" trong thư mục EMARKET/FRONTEND
Sau khi chạy thành công tất cả thư viện cho frontend thì anh em nhập vào terminal "docker compose up --build -d" trong thư mục EMARKET
Sau khi xong thì anh em vào phpmyadmin với host 8081 và import file sql vào. 
Sau đó thì vào trang chính là localhost cổng 80.
Mọi vấn đề liên hệ vào nhóm

Products: Lưu thông tin chung của sản phẩm (sản phẩm cha).
ProductID là khóa chính.
Attributes: Định nghĩa các loại thuộc tính (Màu sắc, Kích thước).
AttributeID là khóa chính.
AttributeValues: Định nghĩa các giá trị cụ thể cho mỗi thuộc tính (Đỏ, Xanh, S, M, L).
AttributeValueID là khóa chính, AttributeID là khóa ngoại tham chiếu đến Attributes.
ProductVariants: Lưu thông tin chi tiết cho từng biến thể của một sản phẩm (SKU, giá, tồn kho, ảnh riêng).
VariantID là khóa chính, ProductID là khóa ngoại tham chiếu đến Products.
ProductVariantAttribute: Bảng trung gian (bảng nối) để thể hiện mối quan hệ nhiều-nhiều giữa ProductVariants và AttributeValues. Một biến thể được tạo thành từ một hoặc nhiều giá trị thuộc tính.
Khóa chính phức hợp (VariantID, AttributeValueID).
VariantID là khóa ngoại tham chiếu đến ProductVariants.
AttributeValueID là khóa ngoại tham chiếu đến AttributeValues.
ProductImages: Có thể lưu các ảnh chung cho sản phẩm (bảng Products) hoặc ảnh chi tiết hơn cho sản phẩm (nếu không phải là ảnh đại diện của biến thể). Ảnh đại diện cho từng biến thể cụ thể nên được lưu trực tiếp trong cột ImageURL của bảng ProductVariants.
CartItems và OrderItems: Sẽ lưu VariantID thay vì ProductID (hoặc có thể lưu cả hai nếu cần, nhưng VariantID là bắt buộc để xác định chính xác phiên bản sản phẩm khách mua). Cột ShopID trong CartItems vẫn quan trọng để nhóm theo shop.
