-- ---
-- Database: xyz_market_db
-- ---


-- Tạo cơ sở dữ liệu nếu chưa tồn tại (tùy chọn)
-- CREATE DATABASE IF NOT EXISTS xyz_market_db
-- CHARACTER SET utf8mb4
-- COLLATE utf8mb4_unicode_ci;


-- USE xyz_market_db;


-- —[
-- Table 'Users'
-- ---
CREATE TABLE IF NOT EXISTS `Users` (
  `UserID` INT AUTO_INCREMENT PRIMARY KEY,
  `Username` VARCHAR(100) NOT NULL UNIQUE,
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `PasswordHash` VARCHAR(255) NOT NULL,
  `FullName` VARCHAR(255) NULL,
  `DefaultShippingAddressID` INT NULL, -- Tham chiếu đến bảng Addresses sau
  `Phone` VARCHAR(20) NULL,
  `Role` ENUM('Buyer', 'Seller', 'Admin') NOT NULL DEFAULT 'Buyer',
  `IsActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`Email`),
  INDEX `idx_users_role` (`Role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'Addresses' (Nếu người dùng có thể có nhiều địa chỉ)
-- ---
CREATE TABLE IF NOT EXISTS `Addresses` (
  `AddressID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID` INT NOT NULL,
  `FullName` VARCHAR(255) NOT NULL, -- Tên người nhận tại địa chỉ này
  `PhoneNumber` VARCHAR(20) NOT NULL, -- SĐT người nhận tại địa chỉ này
  `Street` VARCHAR(255) NOT NULL,
  `Ward` VARCHAR(100) NULL, -- Phường/Xã
  `District` VARCHAR(100) NOT NULL, -- Quận/Huyện
  `City` VARCHAR(100) NOT NULL, -- Tỉnh/Thành phố
  `IsDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_addresses_user_id` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Cập nhật khóa ngoại trong Users sau khi Addresses được tạo
-- ALTER TABLE `Users` ADD CONSTRAINT `fk_users_default_address` FOREIGN KEY (`DefaultShippingAddressID`) REFERENCES `Addresses` (`AddressID`) ON DELETE SET NULL ON UPDATE CASCADE;


-- ---
-- Table 'Shops'
-- ---
CREATE TABLE IF NOT EXISTS `Shops` (
  `ShopID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID_Owner` INT NOT NULL UNIQUE, -- Một User chỉ sở hữu một Shop
  `ShopName` VARCHAR(255) NOT NULL UNIQUE,
  `Description` TEXT NULL,
  `LogoURL` VARCHAR(512) NULL,
  `CoverImageURL` VARCHAR(512) NULL,
  `ShopAddress` TEXT NULL, -- Địa chỉ lấy hàng của Shop
  `ShopPhone` VARCHAR(20) NULL,
  `AverageRating` FLOAT NULL DEFAULT 0,
  `Status` ENUM('PendingApproval', 'Approved', 'Suspended', 'Rejected') NOT NULL DEFAULT 'PendingApproval',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID_Owner`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_shops_shopname` (`ShopName`),
  INDEX `idx_shops_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'PlatformCategories'
-- ---
CREATE TABLE IF NOT EXISTS `PlatformCategories` (
  `CategoryID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  `Description` TEXT NULL,
  `ParentCategoryID` INT NULL, -- Cho danh mục đa cấp
  `Slug` VARCHAR(255) NOT NULL UNIQUE, -- Dùng cho URL thân thiện
  `ImageURL` VARCHAR(512) NULL,
  `IsActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ParentCategoryID`) REFERENCES `PlatformCategories` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_platformcategories_name` (`Name`),
  INDEX `idx_platformcategories_slug` (`Slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'Products'
-- ---
CREATE TABLE IF NOT EXISTS `Products` (
  `ProductID` INT AUTO_INCREMENT PRIMARY KEY,
  `ShopID` INT NOT NULL,
  `CategoryID` INT NOT NULL,
  `Name` VARCHAR(255) NOT NULL,
  `Description` TEXT NULL,
  `SKU` VARCHAR(100) NULL, -- Có thể UNIQUE trong phạm vi Shop
  `Price` DECIMAL(12, 2) NOT NULL,
  `StockQuantity` INT NOT NULL DEFAULT 0,
  `IsActive` BOOLEAN NOT NULL DEFAULT TRUE, -- Shop có cho phép bán sản phẩm này không
  `AdminApprovalStatus` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending', -- Trạng thái duyệt của Admin
  `ReasonForRejection` TEXT NULL, -- Lý do Admin từ chối sản phẩm
  `AverageRating` FLOAT NULL DEFAULT 0,
  `ViewCount` INT DEFAULT 0,
  `SoldCount` INT DEFAULT 0,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`CategoryID`) REFERENCES `PlatformCategories` (`CategoryID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY `uq_product_shop_sku` (`ShopID`, `SKU`), -- SKU là duy nhất cho mỗi Shop
  INDEX `idx_products_name` (`Name`),
  INDEX `idx_products_shop_id` (`ShopID`),
  INDEX `idx_products_category_id` (`CategoryID`),
  INDEX `idx_products_price` (`Price`),
  INDEX `idx_products_admin_approval_status` (`AdminApprovalStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'ProductImages'
-- ---
CREATE TABLE IF NOT EXISTS `ProductImages` (
  `ImageID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProductID` INT NOT NULL,
  `ImageURL` VARCHAR(512) NOT NULL,
  `IsPrimary` BOOLEAN NOT NULL DEFAULT FALSE, -- Ảnh đại diện chính
  `SortOrder` INT DEFAULT 0, -- Thứ tự hiển thị ảnh
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_productimages_product_id` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'Orders_Buyer' (Đơn hàng tổng của người mua)
-- ---
CREATE TABLE IF NOT EXISTS `Orders_Buyer` (
  `OrderID` INT AUTO_INCREMENT PRIMARY KEY,
  `OrderCode` VARCHAR(20) NOT NULL UNIQUE, -- Mã đơn hàng dễ nhớ cho người dùng
  `UserID_Buyer` INT NOT NULL,
  `OrderDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `TotalAmount` DECIMAL(14, 2) NOT NULL, -- Tổng tiền cuối cùng của Buyer (sau khi áp dụng voucher toàn sàn, etc.)
  `ShippingAddressID` INT NOT NULL, -- Tham chiếu đến bảng Addresses
  `ShippingFullName` VARCHAR(255) NOT NULL,
  `ShippingPhoneNumber` VARCHAR(20) NOT NULL,
  `ShippingStreet` VARCHAR(255) NOT NULL,
  `ShippingWard` VARCHAR(100) NULL,
  `ShippingDistrict` VARCHAR(100) NOT NULL,
  `ShippingCity` VARCHAR(100) NOT NULL,
  `Notes` TEXT NULL, -- Ghi chú của người mua
  `PaymentMethod` ENUM('COD', 'BankTransfer', 'OnlineGateway') NOT NULL,
  `PaymentStatus` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `OverallStatus` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned') NOT NULL DEFAULT 'Pending',
  `PlatformVoucherCode` VARCHAR(50) NULL, -- Mã voucher toàn sàn đã áp dụng
  `PlatformDiscountAmount` DECIMAL(12,2) DEFAULT 0, -- Số tiền giảm từ voucher toàn sàn
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID_Buyer`) REFERENCES `Users` (`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`ShippingAddressID`) REFERENCES `Addresses` (`AddressID`) ON DELETE RESTRICT ON UPDATE CASCADE, -- Hoặc không cần FK nếu lưu trực tiếp thông tin
  INDEX `idx_orders_buyer_user_id` (`UserID_Buyer`),
  INDEX `idx_orders_buyer_order_code` (`OrderCode`),
  INDEX `idx_orders_buyer_status` (`OverallStatus`),
  INDEX `idx_orders_buyer_payment_status` (`PaymentStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'ShopOrders' (Phần đơn hàng của từng Shop trong một Order_Buyer)
-- ---
CREATE TABLE IF NOT EXISTS `ShopOrders` (
  `ShopOrderID` INT AUTO_INCREMENT PRIMARY KEY,
  `OrderID` INT NOT NULL, -- FK đến Orders_Buyer
  `ShopID` INT NOT NULL,
  `ShopOrderCode` VARCHAR(25) NOT NULL UNIQUE, -- Mã đơn hàng riêng cho shop
  `SubtotalForShop` DECIMAL(12, 2) NOT NULL, -- Tổng tiền sản phẩm của Shop này
  `ShippingFeeForShop` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Phí ship cho phần hàng của Shop này
  `ShopVoucherCode` VARCHAR(50) NULL, -- Mã voucher của Shop đã áp dụng
  `ShopDiscountAmount` DECIMAL(12,2) DEFAULT 0, -- Số tiền giảm từ voucher của Shop
  `TotalAmountForShop` DECIMAL(12,2) NOT NULL, -- SubtotalForShop + ShippingFeeForShop - ShopDiscountAmount
  `ShopOrderStatus` ENUM('PendingConfirmation', 'Processing', 'ReadyToShip', 'Shipped', 'Delivered', 'CancelledBySeller', 'CancelledByBuyer', 'Returned') NOT NULL DEFAULT 'PendingConfirmation',
  `EstimatedDeliveryDate` DATE NULL,
  `TrackingNumber` VARCHAR(100) NULL, -- Mã vận đơn nếu có
  `ShippingProvider` VARCHAR(100) NULL, -- Đơn vị vận chuyển
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`OrderID`) REFERENCES `Orders_Buyer` (`OrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_shoporders_order_id` (`OrderID`),
  INDEX `idx_shoporders_shop_id` (`ShopID`),
  INDEX `idx_shoporders_status` (`ShopOrderStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'OrderItems'
-- ---
CREATE TABLE IF NOT EXISTS `OrderItems` (
  `OrderItemID` INT AUTO_INCREMENT PRIMARY KEY,
  `ShopOrderID` INT NOT NULL,
  `ProductID` INT NOT NULL,
  `Quantity` INT NOT NULL,
  `PriceAtPurchase` DECIMAL(12, 2) NOT NULL, -- Giá sản phẩm tại thời điểm mua
  `Subtotal` DECIMAL(14, 2) NOT NULL, -- Quantity * PriceAtPurchase
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ShopOrderID`) REFERENCES `ShopOrders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE RESTRICT ON UPDATE CASCADE, -- RESTRICT để tránh xóa SP khi đã có trong đơn hàng
  INDEX `idx_orderitems_shop_order_id` (`ShopOrderID`),
  INDEX `idx_orderitems_product_id` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'Carts' (Lưu giỏ hàng của người dùng đã đăng nhập)
-- ---
CREATE TABLE IF NOT EXISTS `Carts` (
  `CartID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID_Buyer` INT NOT NULL UNIQUE, -- Mỗi User có một Cart
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID_Buyer`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'CartItems'
-- ---
CREATE TABLE IF NOT EXISTS `CartItems` (
  `CartItemID` INT AUTO_INCREMENT PRIMARY KEY,
  `CartID` INT NOT NULL,
  `ProductID` INT NOT NULL,
  `ShopID` INT NOT NULL, -- Lưu lại ShopID để dễ nhóm khi hiển thị giỏ hàng
  `Quantity` INT NOT NULL,
  `AddedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`CartID`) REFERENCES `Carts` (`CartID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_cartitem_cart_product` (`CartID`, `ProductID`), -- Mỗi sản phẩm chỉ xuất hiện 1 lần trong giỏ
  INDEX `idx_cartitems_cart_id` (`CartID`),
  INDEX `idx_cartitems_product_id` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'ProductReviews'
-- ---
CREATE TABLE IF NOT EXISTS `ProductReviews` (
  `ReviewID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProductID` INT NOT NULL,
  `UserID_Buyer` INT NOT NULL,
  `ShopOrderID` INT NULL, -- Liên kết với đơn hàng cụ thể để xác thực "đã mua"
  `Rating` TINYINT NOT NULL CHECK (`Rating` >= 1 AND `Rating` <= 5),
  `Comment` TEXT NULL,
  `ReviewImages` JSON NULL, -- Lưu danh sách URL ảnh review dưới dạng JSON array
  `IsApproved` BOOLEAN NOT NULL DEFAULT TRUE, -- Admin có thể duyệt review
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`UserID_Buyer`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ShopOrderID`) REFERENCES `ShopOrders` (`ShopOrderID`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `uq_productreview_user_product_order` (`UserID_Buyer`, `ProductID`, `ShopOrderID`), -- Một người chỉ review 1 SP trong 1 đơn hàng
  INDEX `idx_productreviews_product_id` (`ProductID`),
  INDEX `idx_productreviews_user_id` (`UserID_Buyer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'ShopReviews'
-- ---
CREATE TABLE IF NOT EXISTS `ShopReviews` (
  `ReviewID` INT AUTO_INCREMENT PRIMARY KEY,
  `ShopID` INT NOT NULL,
  `UserID_Buyer` INT NOT NULL,
  `ShopOrderID` INT NULL, -- Liên kết với đơn hàng cụ thể để xác thực "đã mua từ shop"
  `Rating` TINYINT NOT NULL CHECK (`Rating` >= 1 AND `Rating` <= 5),
  `Comment` TEXT NULL,
  `IsApproved` BOOLEAN NOT NULL DEFAULT TRUE,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`UserID_Buyer`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ShopOrderID`) REFERENCES `ShopOrders` (`ShopOrderID`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `uq_shopreview_user_shop_order` (`UserID_Buyer`, `ShopID`, `ShopOrderID`),
  INDEX `idx_shopreviews_shop_id` (`ShopID`),
  INDEX `idx_shopreviews_user_id` (`UserID_Buyer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'Vouchers'
-- ---
CREATE TABLE IF NOT EXISTS `Vouchers` (
  `VoucherID` INT AUTO_INCREMENT PRIMARY KEY,
  `Code` VARCHAR(50) NOT NULL UNIQUE,
  `Description` TEXT NULL,
  `DiscountType` ENUM('Percentage', 'FixedAmount') NOT NULL,
  `DiscountValue` DECIMAL(10, 2) NOT NULL,
  `MaxValueForPercentage` DECIMAL(10,2) NULL, -- Giới hạn giảm tối đa cho loại Percentage
  `MinOrderValue` DECIMAL(12,2) DEFAULT 0, -- Giá trị đơn hàng tối thiểu để áp dụng
  `StartDate` DATETIME NOT NULL,
  `EndDate` DATETIME NOT NULL,
  `UsageLimitPerUser` INT NULL, -- Số lần một user có thể dùng
  `UsageLimitTotal` INT NULL, -- Tổng số lần voucher có thể dùng
  `TimesUsed` INT NOT NULL DEFAULT 0,
  `Scope` ENUM('Platform', 'Shop') NOT NULL,
  `ShopID` INT NULL, -- FK đến Shops, chỉ có giá trị nếu Scope='Shop'
  `IsActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_vouchers_code` (`Code`),
  INDEX `idx_vouchers_scope_shop_id` (`Scope`, `ShopID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'UserUsedVouchers' (Theo dõi user đã dùng voucher nào, bao nhiêu lần)
-- ---
CREATE TABLE IF NOT EXISTS `UserUsedVouchers` (
  `UserUsedVoucherID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID` INT NOT NULL,
  `VoucherID` INT NOT NULL,
  `ShopOrderID` INT NOT NULL, -- Đơn hàng đã áp dụng voucher này
  `TimesUsedThisOrder` INT NOT NULL DEFAULT 1,
  `UsedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`VoucherID`) REFERENCES `Vouchers` (`VoucherID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ShopOrderID`) REFERENCES `ShopOrders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_user_voucher_order` (`UserID`, `VoucherID`, `ShopOrderID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




-- ---
-- Table 'ShopFollows'
-- ---
CREATE TABLE IF NOT EXISTS `ShopFollows` (
  `FollowID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID_Buyer` INT NOT NULL,
  `ShopID` INT NOT NULL,
  `FollowedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID_Buyer`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_shopfollow_user_shop` (`UserID_Buyer`, `ShopID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'Conversations' (Cho tính năng Chat)
-- ---
CREATE TABLE IF NOT EXISTS `Conversations` (
  `ConversationID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserOneID` INT NOT NULL, -- Người dùng thứ nhất
  `UserTwoID` INT NOT NULL, -- Người dùng thứ hai (Buyer và Seller)
  `LastMessageID` INT NULL, -- Tham chiếu đến tin nhắn cuối cùng (tùy chọn, để lấy nhanh)
  `LastMessageAt` TIMESTAMP NULL,
  `UserOneUnreadCount` INT DEFAULT 0,
  `UserTwoUnreadCount` INT DEFAULT 0,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserOneID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`UserTwoID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  -- FOREIGN KEY (`LastMessageID`) REFERENCES `ChatMessages` (`MessageID`) ON DELETE SET NULL ON UPDATE CASCADE, -- Sẽ tạo ChatMessages sau
  UNIQUE KEY `uq_conversation_users` (`UserOneID`, `UserTwoID`),
  CHECK (`UserOneID` < `UserTwoID`) -- Để tránh trùng lặp (1,2) và (2,1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'ChatMessages'
-- ---
CREATE TABLE IF NOT EXISTS `ChatMessages` (
  `MessageID` INT AUTO_INCREMENT PRIMARY KEY,
  `ConversationID` INT NOT NULL,
  `SenderUserID` INT NOT NULL,
  `ReceiverUserID` INT NOT NULL,
  `MessageContent` TEXT NOT NULL,
  `MessageType` ENUM('Text', 'Image', 'ProductLink') DEFAULT 'Text',
  `IsRead` BOOLEAN DEFAULT FALSE,
  `ReadAt` TIMESTAMP NULL,
  `SentAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ConversationID`) REFERENCES `Conversations` (`ConversationID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`SenderUserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ReceiverUserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_chatmessages_conversation_id` (`ConversationID`),
  INDEX `idx_chatmessages_sender_id` (`SenderUserID`),
  INDEX `idx_chatmessages_receiver_id` (`ReceiverUserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Cập nhật FK trong Conversations sau khi ChatMessages được tạo
-- ALTER TABLE `Conversations` ADD CONSTRAINT `fk_conversations_last_message` FOREIGN KEY (`LastMessageID`) REFERENCES `ChatMessages` (`MessageID`) ON DELETE SET NULL ON UPDATE CASCADE;


-- ---
-- Table 'Banners' (Quản lý banner quảng cáo)
-- ---
CREATE TABLE IF NOT EXISTS `Banners` (
    `BannerID` INT AUTO_INCREMENT PRIMARY KEY,
    `Title` VARCHAR(255) NULL,
    `ImageURL` VARCHAR(512) NOT NULL,
    `LinkURL` VARCHAR(512) NULL,
    `Position` VARCHAR(100) NULL, -- Vị trí hiển thị (e.g., 'homepage_main', 'category_sidebar')
    `SortOrder` INT DEFAULT 0,
    `IsActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `StartDate` DATETIME NULL,
    `EndDate` DATETIME NULL,
    `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_banners_position_isactive` (`Position`, `IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---
-- Table 'SiteSettings' (Lưu các cài đặt chung của website)
-- ---
CREATE TABLE IF NOT EXISTS `SiteSettings` (
    `SettingKey` VARCHAR(100) PRIMARY KEY,
    `SettingValue` TEXT NULL,
    `Description` VARCHAR(255) NULL,
    `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
