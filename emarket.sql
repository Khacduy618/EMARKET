-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: db:3306
-- Thời gian đã tạo: Th5 29, 2025 lúc 08:24 AM
-- Phiên bản máy phục vụ: 8.0.42
-- Phiên bản PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `emarket`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Addresses`
--

CREATE TABLE `Addresses` (
  `AddressID` int NOT NULL,
  `UserID` int NOT NULL,
  `FullName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhoneNumber` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Street` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ward` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `District` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `City` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsDefault` tinyint(1) NOT NULL DEFAULT '0',
  `DeletedAt` timestamp NULL DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Addresses`
--

INSERT INTO `Addresses` (`AddressID`, `UserID`, `FullName`, `PhoneNumber`, `Street`, `Ward`, `District`, `City`, `IsDefault`, `DeletedAt`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Nguyễn Văn An', '0901234561', '123 Đường Hoa Mai', 'Phường 2', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(2, 1, 'Văn Phòng An Nguyễn', '0901234561', 'Tầng 5, 456 Tòa nhà Bitexco', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 0, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(3, 2, 'Trần Thị Bích', '0901234562', '789 Hẻm Hoa Sứ', 'Phường 7', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(4, 4, 'Phạm Thị Dung', '0901234564', 'Số nhà 10, Ngõ 15', 'Phường Quang Trung', 'Quận Đống Đa', 'TP. Hà Nội', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Attributes`
--

CREATE TABLE `Attributes` (
  `AttributeID` int NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Attributes`
--

INSERT INTO `Attributes` (`AttributeID`, `Name`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Màu sắc', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(2, 'Kích thước', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(3, 'Dung lượng RAM', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(4, 'Bộ nhớ trong (ROM)', '2025-05-29 07:59:17', '2025-05-29 07:59:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `AttributeValues`
--

CREATE TABLE `AttributeValues` (
  `AttributeValueID` int NOT NULL,
  `AttributeID` int NOT NULL,
  `Value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `AttributeValues`
--

INSERT INTO `AttributeValues` (`AttributeValueID`, `AttributeID`, `Value`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Đen', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(2, 1, 'Trắng', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(3, 1, 'Xanh Dương', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(4, 1, 'Vàng Gold', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(5, 1, 'Hồng', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(6, 2, 'S', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(7, 2, 'M', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(8, 2, 'L', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(9, 2, 'XL', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(10, 2, 'XXL', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(11, 3, '4GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(12, 3, '8GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(13, 3, '16GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(14, 3, '32GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(15, 4, '64GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(16, 4, '128GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(17, 4, '256GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(18, 4, '512GB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(19, 4, '1TB', '2025-05-29 07:59:17', '2025-05-29 07:59:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banners`
--

CREATE TABLE `banners` (
  `BannerID` int NOT NULL,
  `Title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ImageURL` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `LinkURL` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SortOrder` int DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `banners`
--

INSERT INTO `banners` (`BannerID`, `Title`, `ImageURL`, `LinkURL`, `Position`, `SortOrder`, `IsActive`, `StartDate`, `EndDate`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'ĐẠI TIỆC SALE HÈ 2025', '/images/banners/summer_mega_sale_2025.jpg', '/campaign/summer-mega-sale', 'homepage_carousel', 0, 1, '2025-06-01 00:00:00', '2025-06-15 23:59:59', '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(2, 'TOP LAPTOP BÁN CHẠY', '/images/banners/top_laptops.jpg', '/category/laptop?sort=top_selling', 'homepage_below_carousel', 1, 1, NULL, NULL, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(3, 'PHỤ KIỆN GIẢM ĐẾN 50%', '/images/banners/accessories_half_price.jpg', '/category/phu-kien-dien-thoai?filter=sale_50', 'category_page_sidebar', 0, 1, '2025-05-25 00:00:00', '2025-06-25 23:59:59', '2025-05-29 08:19:46', '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `CartItems`
--

CREATE TABLE `CartItems` (
  `CartItemID` int NOT NULL,
  `CartID` int NOT NULL,
  `VariantID` int NOT NULL,
  `ShopID` int NOT NULL,
  `Quantity` int NOT NULL,
  `AddedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `CartItems`
--

INSERT INTO `CartItems` (`CartItemID`, `CartID`, `VariantID`, `ShopID`, `Quantity`, `AddedAt`, `UpdatedAt`) VALUES
(1, 1, 1, 1, 1, '2025-05-29 08:06:53', '2025-05-29 08:06:53'),
(2, 1, 5, 2, 2, '2025-05-29 08:06:53', '2025-05-29 08:06:53'),
(3, 2, 3, 1, 1, '2025-05-29 08:06:53', '2025-05-29 08:06:53'),
(4, 2, 7, 1, 1, '2025-05-29 08:06:53', '2025-05-29 08:06:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Carts`
--

CREATE TABLE `Carts` (
  `CartID` int NOT NULL,
  `UserID` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Carts`
--

INSERT INTO `Carts` (`CartID`, `UserID`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, '2025-05-29 08:06:53', '2025-05-29 08:06:53'),
(2, 5, '2025-05-29 08:06:53', '2025-05-29 08:06:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `FlashSaleCampaigns`
--

CREATE TABLE `FlashSaleCampaigns` (
  `CampaignID` int NOT NULL,
  `AdminUserID` int NOT NULL,
  `CampaignName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chương trình Flash Sale',
  `StartTime` datetime NOT NULL,
  `EndTime` datetime NOT NULL,
  `Status` enum('Upcoming','Active','Ended','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Upcoming',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `FlashSaleCampaigns`
--

INSERT INTO `FlashSaleCampaigns` (`CampaignID`, `AdminUserID`, `CampaignName`, `StartTime`, `EndTime`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 4, 'Siêu Sale Giữa Năm', '2025-06-15 00:00:00', '2025-06-17 23:59:59', 'Upcoming', '2025-05-29 15:06:53', '2025-05-29 15:06:53'),
(2, 4, 'Flash Sale Cuối Tuần Tháng 5', '2025-05-30 10:00:00', '2025-06-01 22:00:00', 'Upcoming', '2025-05-29 15:06:53', '2025-05-29 15:06:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `FlashSaleDeals`
--

CREATE TABLE `FlashSaleDeals` (
  `DealID` int NOT NULL,
  `CampaignID` int NOT NULL,
  `VariantID` int NOT NULL,
  `FlashSalePrice` int NOT NULL,
  `OriginalPrice` int NOT NULL,
  `FlashSaleStock` int NOT NULL,
  `StockSold` int NOT NULL DEFAULT '0',
  `DealStartTime` datetime NOT NULL,
  `DealEndTime` datetime NOT NULL,
  `Status` enum('PendingApproval','Approved_Upcoming','Approved_Active','Approved_Ended','Rejected','SoldOut','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingApproval'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `FlashSaleDeals`
--

INSERT INTO `FlashSaleDeals` (`DealID`, `CampaignID`, `VariantID`, `FlashSalePrice`, `OriginalPrice`, `FlashSaleStock`, `StockSold`, `DealStartTime`, `DealEndTime`, `Status`) VALUES
(1, 1, 1, 27500000, 28990000, 20, 0, '2025-06-15 09:00:00', '2025-06-15 12:00:00', 'Approved_Upcoming'),
(2, 2, 5, 299000, 350000, 50, 0, '2025-05-31 12:00:00', '2025-05-31 14:00:00', 'Approved_Upcoming'),
(3, 2, 3, 2200000, 2490000, 30, 0, '2025-05-30 18:00:00', '2025-05-30 20:00:00', 'Approved_Upcoming');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `OrderItems`
--

CREATE TABLE `OrderItems` (
  `OrderItemID` int NOT NULL,
  `OrderID` int NOT NULL,
  `VariantID` int NOT NULL,
  `Quantity` int NOT NULL,
  `PriceAtPurchase` int NOT NULL,
  `Subtotal` int NOT NULL,
  `IsFlashSaleItem` tinyint(1) NOT NULL DEFAULT '0',
  `FlashSaleDealID` int DEFAULT NULL,
  `ReturnStatus` enum('None','Requested','Approved','Rejected','Returned','Refunded','PartiallyRefunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'None',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `OrderItems`
--

INSERT INTO `OrderItems` (`OrderItemID`, `OrderID`, `VariantID`, `Quantity`, `PriceAtPurchase`, `Subtotal`, `IsFlashSaleItem`, `FlashSaleDealID`, `ReturnStatus`, `CreatedAt`) VALUES
(1, 1, 1, 1, 28990000, 28990000, 0, NULL, 'None', '2025-05-29 08:19:46'),
(2, 1, 5, 1, 350000, 350000, 0, NULL, 'None', '2025-05-29 08:19:46'),
(3, 2, 3, 1, 2490000, 2490000, 0, NULL, 'None', '2025-05-29 08:19:46'),
(4, 3, 1, 1, 27500000, 27500000, 1, 1, 'None', '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `OrdersBuyer`
--

CREATE TABLE `OrdersBuyer` (
  `OrderID` int NOT NULL,
  `OrderCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int NOT NULL,
  `OrderDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TotalAmount` int NOT NULL,
  `SubtotalAmount` int NOT NULL,
  `ShippingFee` int NOT NULL DEFAULT '0',
  `DiscountAmount` int DEFAULT '0',
  `ShippingAddressID` int NOT NULL,
  `ShippingFullName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShippingPhoneNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `PaymentMethod` enum('COD','BankTransfer','OnlineGateway') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PaymentStatus` enum('Pending','Paid','Failed','Refunded','PartiallyRefunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `OverallStatus` enum('Pending','Processing','Shipped','Delivered','CancelledByBuyer','CancelledBySeller','Returned','ReturnInProgress','Completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `PlatformVoucherCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PlatformDiscountAmount` decimal(12,2) DEFAULT '0.00',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `OrdersBuyer`
--

INSERT INTO `OrdersBuyer` (`OrderID`, `OrderCode`, `UserID`, `OrderDate`, `TotalAmount`, `SubtotalAmount`, `ShippingFee`, `DiscountAmount`, `ShippingAddressID`, `ShippingFullName`, `ShippingPhoneNumber`, `Notes`, `PaymentMethod`, `PaymentStatus`, `OverallStatus`, `PlatformVoucherCode`, `PlatformDiscountAmount`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'EMK2025001', 1, '2025-05-29 08:19:46', 34340000, 29340000, 5000000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Pending', NULL, 0.00, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(2, 'EMK2025002', 5, '2025-05-29 08:19:46', 2465000, 2490000, 25000, 50000, 4, 'Phạm Thị Dung', '0901234564', NULL, 'OnlineGateway', 'Paid', 'Processing', 'WELCOME50K', 50000.00, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(3, 'EMKFS2025003', 1, '2025-05-29 08:19:46', 27530000, 27500000, 30000, 0, 2, 'Văn Phòng An Nguyễn', '0901234561', NULL, 'COD', 'Pending', 'Pending', NULL, 0.00, '2025-05-29 08:19:46', '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `PlatformCategories`
--

CREATE TABLE `PlatformCategories` (
  `CategoryID` int NOT NULL,
  `Name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ParentCategoryID` int DEFAULT NULL,
  `Slug` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ImageURL` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `PlatformCategories`
--

INSERT INTO `PlatformCategories` (`CategoryID`, `Name`, `Description`, `ParentCategoryID`, `Slug`, `ImageURL`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Điện tử', 'Các thiết bị điện tử, công nghệ', NULL, 'dien-tu', '/images/categories/electronics.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(2, 'Điện thoại & Máy tính bảng', 'Điện thoại thông minh, máy tính bảng và phụ kiện', 1, 'dien-thoai-may-tinh-bang', '/images/categories/mobile_tablet.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(3, 'Máy tính & Laptop', 'Máy tính để bàn, laptop, linh kiện máy tính', 1, 'may-tinh-laptop', '/images/categories/computer_laptop.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(4, 'Thời trang', 'Quần áo, giày dép và phụ kiện thời trang', NULL, 'thoi-trang', '/images/categories/fashion.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(5, 'Thời trang Nam', 'Quần áo, giày dép cho nam giới', 4, 'thoi-trang-nam', '/images/categories/fashion_men.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(6, 'Điện thoại di động', 'Các loại điện thoại di động thông minh', 2, 'dien-thoai-di-dong', '/images/categories/smartphones.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(7, 'Phụ kiện điện thoại', 'Ốp lưng, sạc, cáp, tai nghe...', 2, 'phu-kien-dien-thoai', '/images/categories/phone_accessories.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ProductImages`
--

CREATE TABLE `ProductImages` (
  `ImageID` int NOT NULL,
  `ProductID` int NOT NULL,
  `ImageURL` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `SortOrder` int DEFAULT '0',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ProductImages`
--

INSERT INTO `ProductImages` (`ImageID`, `ProductID`, `ImageURL`, `IsPrimary`, `SortOrder`, `CreatedAt`) VALUES
(1, 1, '/images/products_gallery/xpromax_gallery1.jpg', 1, 0, '2025-05-29 08:06:53'),
(2, 1, '/images/products_gallery/xpromax_gallery2.jpg', 0, 1, '2025-05-29 08:06:53'),
(3, 1, '/images/products_gallery/xpromax_gallery3.jpg', 0, 2, '2025-05-29 08:06:53'),
(4, 3, '/images/products_gallery/tshirt_model1.jpg', 1, 0, '2025-05-29 08:06:53'),
(5, 3, '/images/products_gallery/tshirt_fabric_detail.jpg', 0, 1, '2025-05-29 08:06:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ProductReviews`
--

CREATE TABLE `ProductReviews` (
  `ReviewID` int NOT NULL,
  `ProductID` int NOT NULL,
  `UserID` int NOT NULL,
  `OrderID` int DEFAULT NULL,
  `Rating` tinyint NOT NULL,
  `Comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ReviewImages` json DEFAULT NULL,
  `IsApproved` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Đang đổ dữ liệu cho bảng `ProductReviews`
--

INSERT INTO `ProductReviews` (`ReviewID`, `ProductID`, `UserID`, `OrderID`, `Rating`, `Comment`, `ReviewImages`, `IsApproved`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 1, 1, 5, 'Điện thoại tuyệt vời, camera chụp ảnh siêu nét! Giao hàng nhanh.', '[\"/images/reviews/phone_good_1.jpg\"]', 1, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(2, 2, 5, 2, 4, 'Tai nghe nghe hay, chống ồn tốt. Thiết kế đẹp nhưng hộp sạc hơi dễ trầy.', NULL, 1, '2025-05-29 08:19:46', '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Products`
--

CREATE TABLE `Products` (
  `ProductID` int NOT NULL,
  `ShopID` int NOT NULL,
  `CategoryID` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Discount` int NOT NULL DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `AdminApprovalStatus` enum('Pending','Approved','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `ReasonForRejection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Products`
--

INSERT INTO `Products` (`ProductID`, `ShopID`, `CategoryID`, `Name`, `Description`, `Discount`, `IsActive`, `AdminApprovalStatus`, `ReasonForRejection`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 6, 'Smartphone X Pro Max', 'Điện thoại thông minh X Pro Max với camera 108MP, chip Snapdragon 8 Gen 3, màn hình AMOLED 120Hz.', 5, 1, 'Approved', NULL, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(2, 1, 7, 'Tai nghe không dây Z Buds 3', 'Tai nghe true wireless Z Buds 3, chống ồn chủ động, thời lượng pin 8 tiếng.', 10, 1, 'Approved', NULL, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(3, 2, 3, 'Áo Thun Nam Cotton Cao Cấp', 'Áo thun nam cổ tròn, 100% cotton, co giãn 4 chiều, thấm hút mồ hôi.', 0, 1, 'Approved', NULL, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(4, 1, 5, 'Laptop UltraBook Y Slim', 'Laptop mỏng nhẹ UltraBook Y Slim, Intel Core i7 thế hệ 13, RAM 16GB, SSD 512GB.', 7, 1, 'Pending', NULL, '2025-05-29 08:02:54', '2025-05-29 08:02:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ProductVariantAttribute`
--

CREATE TABLE `ProductVariantAttribute` (
  `VariantID` int NOT NULL,
  `AttributeValueID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ProductVariantAttribute`
--

INSERT INTO `ProductVariantAttribute` (`VariantID`, `AttributeValueID`) VALUES
(1, 1),
(4, 1),
(5, 1),
(3, 2),
(6, 2),
(2, 3),
(5, 7),
(6, 8),
(7, 13),
(1, 17),
(2, 18),
(7, 18);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ProductVariants`
--

CREATE TABLE `ProductVariants` (
  `VariantID` int NOT NULL,
  `ProductID` int NOT NULL,
  `SKU` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Price` int NOT NULL,
  `CompareAtPrice` int DEFAULT NULL,
  `StockQuantity` int NOT NULL DEFAULT '0',
  `ImageURL` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ProductVariants`
--

INSERT INTO `ProductVariants` (`VariantID`, `ProductID`, `SKU`, `Price`, `CompareAtPrice`, `StockQuantity`, `ImageURL`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'XPROMAX-BLK-256', 28990000, 30500000, 50, '/images/variants/xpromax_black_256.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(2, 1, 'XPROMAX-BLU-512', 32990000, 34500000, 30, '/images/variants/xpromax_blue_512.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(3, 2, 'ZBUDS3-WHT', 2490000, 2790000, 100, '/images/variants/zbuds3_white.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(4, 2, 'ZBUDS3-BLK', 2490000, 2790000, 80, '/images/variants/zbuds3_black.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(5, 3, 'TSHIRT-COT-BLK-M', 350000, NULL, 150, '/images/variants/tshirt_cotton_black_m.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(6, 3, 'TSHIRT-COT-WHT-L', 350000, NULL, 120, '/images/variants/tshirt_cotton_white_l.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(7, 4, 'ULTRA-Y-SLV-16-512', 25990000, 27990000, 25, '/images/variants/ultray_silver.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ReturnRequests`
--

CREATE TABLE `ReturnRequests` (
  `ReturnRequestID` int NOT NULL,
  `OrderID` int NOT NULL,
  `OrderItemID` int DEFAULT NULL,
  `UserID` int NOT NULL,
  `ShopID` int NOT NULL,
  `RequestType` enum('Return','Refund','ReturnAndRefund') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ReasonCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ReasonDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `EvidenceURLs` json DEFAULT NULL,
  `Status` enum('PendingSellerApproval','SellerApproved_WaitForReturn','SellerReceivedProduct','RefundProcessing','Refunded','SellerRejected','BuyerCancelled','AdminIntervention','Closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingSellerApproval',
  `SellerNote` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `AdminNote` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ResolutionType` enum('FullRefund','PartialRefund','ProductExchange','NoAction','StoreCredit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `RefundAmount` decimal(12,2) DEFAULT NULL,
  `BuyerShippingInfoForReturn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ShopShippingInfoForReturn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `RequestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ReturnRequests`
--

INSERT INTO `ReturnRequests` (`ReturnRequestID`, `OrderID`, `OrderItemID`, `UserID`, `ShopID`, `RequestType`, `ReasonCode`, `ReasonDescription`, `EvidenceURLs`, `Status`, `SellerNote`, `AdminNote`, `ResolutionType`, `RefundAmount`, `BuyerShippingInfoForReturn`, `ShopShippingInfoForReturn`, `RequestedAt`, `LastUpdatedAt`) VALUES
(1, 1, 1, 1, 1, 'ReturnAndRefund', 'ITEM_DEFECTIVE', 'Sản phẩm bị lỗi màn hình, có điểm chết.', '[\"/images/returns/defective_screen1.jpg\"]', 'PendingSellerApproval', NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-29 08:19:46', '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ShopFollows`
--

CREATE TABLE `ShopFollows` (
  `FollowID` int NOT NULL,
  `UserID` int NOT NULL,
  `ShopID` int NOT NULL,
  `FollowedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ShopFollows`
--

INSERT INTO `ShopFollows` (`FollowID`, `UserID`, `ShopID`, `FollowedAt`) VALUES
(1, 1, 2, '2025-05-29 08:19:46'),
(2, 5, 1, '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Shops`
--

CREATE TABLE `Shops` (
  `ShopID` int NOT NULL,
  `UserID` int NOT NULL,
  `ShopName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `LogoURL` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CoverImageURL` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AddressStreet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AddressWard` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AddressDistrict` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AddressCity` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ShopPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Level` enum('Thường','Mall') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Thường',
  `Status` enum('PendingApproval','Approved','Suspended','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingApproval',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Shops`
--

INSERT INTO `Shops` (`ShopID`, `UserID`, `ShopName`, `Description`, `LogoURL`, `CoverImageURL`, `AddressStreet`, `AddressWard`, `AddressDistrict`, `AddressCity`, `ShopPhone`, `Level`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 2, 'Bích Tech Store', 'Chuyên hàng công nghệ chính hãng, giá tốt.', '/images/logos/bichtech.png', '/images/covers/bichtech_cover.png', '101 Võ Văn Tần', 'Phường 6', 'Quận 3', 'TP. Hồ Chí Minh', '0901234562', 'Mall', 'Approved', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(2, 5, 'E-Style Fashion', 'Thời trang nam nữ, cập nhật xu hướng mới nhất.', '/images/logos/estyle.png', '/images/covers/estyle_cover.png', '202 Trần Hưng Đạo', 'Phường Nguyễn Cư Trinh', 'Quận 1', 'TP. Hồ Chí Minh', '0901234565', 'Thường', 'PendingApproval', '2025-05-29 07:59:17', '2025-05-29 07:59:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Users`
--

CREATE TABLE `Users` (
  `UserID` int NOT NULL,
  `Username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `FullName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Phone` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Level` enum('Đồng','Bạc','Vàng','Bạch kim','Kim cương') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Đồng',
  `Role` enum('Người mua','Người bán','Quản trị viên') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Người mua',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `Token` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Users`
--

INSERT INTO `Users` (`UserID`, `Username`, `Email`, `Password`, `FullName`, `Phone`, `Level`, `Role`, `IsActive`, `Token`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'buyer01', 'buyer01@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Nguyễn Văn An', '0901234561', 'Đồng', 'Người mua', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(2, 'seller01', 'seller01@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Trần Thị Bích', '0901234562', 'Bạc', 'Người bán', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(3, 'admin01', 'admin01@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Lê Văn Cường (Admin)', '0901234563', 'Kim cương', 'Quản trị viên', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(4, 'buyer02', 'buyer02@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Phạm Thị Dung', '0901234564', 'Đồng', 'Người mua', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(5, 'seller02', 'seller02@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Hoàng Văn E', '0901234565', 'Vàng', 'Người bán', 0, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `UserVouchers`
--

CREATE TABLE `UserVouchers` (
  `UserVoucherID` int NOT NULL,
  `UserID` int NOT NULL,
  `VoucherID` int NOT NULL,
  `ShopID` int DEFAULT NULL,
  `TimesUsedThisOrder` int DEFAULT NULL,
  `UsedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `UserVouchers`
--

INSERT INTO `UserVouchers` (`UserVoucherID`, `UserID`, `VoucherID`, `ShopID`, `TimesUsedThisOrder`, `UsedAt`) VALUES
(1, 5, 1, NULL, 1, '2025-05-29 08:19:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Vouchers`
--

CREATE TABLE `Vouchers` (
  `VoucherID` int NOT NULL,
  `Code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `DiscountType` enum('Percentage','FixedAmount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DiscountValue` int NOT NULL,
  `MaxValueForPercentage` int DEFAULT NULL,
  `MinOrderValue` int DEFAULT '0',
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL,
  `UsageLimitPerUser` int DEFAULT NULL,
  `UsageLimitTotal` int DEFAULT NULL,
  `TimesUsed` int NOT NULL DEFAULT '0',
  `Scope` enum('Platform','Shop') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShopID` int DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedBy` enum('Admin','Seller') COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Vouchers`
--

INSERT INTO `Vouchers` (`VoucherID`, `Code`, `Description`, `DiscountType`, `DiscountValue`, `MaxValueForPercentage`, `MinOrderValue`, `StartDate`, `EndDate`, `UsageLimitPerUser`, `UsageLimitTotal`, `TimesUsed`, `Scope`, `ShopID`, `IsActive`, `CreatedBy`, `UserID`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'WELCOME50', 'Giảm 50,000đ cho đơn hàng đầu tiên từ 200,000đ', 'FixedAmount', 50000, NULL, 200000, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1, 1000, 1, 'Platform', NULL, 1, 'Admin', 4, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(2, 'BICHTECH10', 'Bích Tech Store giảm 10% tối đa 100K cho đơn từ 500K', 'Percentage', 10, 100000, 500000, '2025-05-01 00:00:00', '2025-06-30 23:59:59', 1, 200, 0, 'Shop', 1, 1, 'Seller', 2, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(3, 'FREESHIPMAX', 'Miễn phí vận chuyển tối đa 30K', 'FixedAmount', 30000, NULL, 99000, '2025-05-20 00:00:00', '2025-06-20 23:59:59', NULL, 500, 0, 'Platform', NULL, 1, 'Admin', 4, '2025-05-29 08:19:46', '2025-05-29 08:19:46');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `Addresses`
--
ALTER TABLE `Addresses`
  ADD PRIMARY KEY (`AddressID`),
  ADD KEY `idx_addresses_user_id` (`UserID`);

--
-- Chỉ mục cho bảng `Attributes`
--
ALTER TABLE `Attributes`
  ADD PRIMARY KEY (`AttributeID`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- Chỉ mục cho bảng `AttributeValues`
--
ALTER TABLE `AttributeValues`
  ADD PRIMARY KEY (`AttributeValueID`),
  ADD UNIQUE KEY `uq_attribute_value` (`AttributeID`,`Value`);

--
-- Chỉ mục cho bảng `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`BannerID`),
  ADD KEY `idx_banners_position_isactive` (`Position`,`IsActive`);

--
-- Chỉ mục cho bảng `CartItems`
--
ALTER TABLE `CartItems`
  ADD PRIMARY KEY (`CartItemID`),
  ADD UNIQUE KEY `uq_cartitem_cart_variant` (`CartID`,`VariantID`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_cartitems_cart_id` (`CartID`),
  ADD KEY `fk_cartitems_variant_idx` (`VariantID`);

--
-- Chỉ mục cho bảng `Carts`
--
ALTER TABLE `Carts`
  ADD PRIMARY KEY (`CartID`),
  ADD UNIQUE KEY `UserID` (`UserID`);

--
-- Chỉ mục cho bảng `FlashSaleCampaigns`
--
ALTER TABLE `FlashSaleCampaigns`
  ADD PRIMARY KEY (`CampaignID`),
  ADD KEY `AdminUserID` (`AdminUserID`);

--
-- Chỉ mục cho bảng `FlashSaleDeals`
--
ALTER TABLE `FlashSaleDeals`
  ADD PRIMARY KEY (`DealID`),
  ADD KEY `CampaignID` (`CampaignID`),
  ADD KEY `VariantID` (`VariantID`);

--
-- Chỉ mục cho bảng `OrderItems`
--
ALTER TABLE `OrderItems`
  ADD PRIMARY KEY (`OrderItemID`),
  ADD KEY `idx_orderitems_order_id` (`OrderID`),
  ADD KEY `fk_orderitems_variant_idx` (`VariantID`),
  ADD KEY `fk_orderitems_flashsaledeal_idx` (`FlashSaleDealID`);

--
-- Chỉ mục cho bảng `OrdersBuyer`
--
ALTER TABLE `OrdersBuyer`
  ADD PRIMARY KEY (`OrderID`),
  ADD UNIQUE KEY `OrderCode` (`OrderCode`),
  ADD KEY `ShippingAddressID` (`ShippingAddressID`),
  ADD KEY `idx_orders_buyer_user_id` (`UserID`),
  ADD KEY `idx_orders_buyer_order_code` (`OrderCode`),
  ADD KEY `idx_orders_buyer_status` (`OverallStatus`),
  ADD KEY `idx_orders_buyer_payment_status` (`PaymentStatus`);

--
-- Chỉ mục cho bảng `PlatformCategories`
--
ALTER TABLE `PlatformCategories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `Slug` (`Slug`),
  ADD KEY `ParentCategoryID` (`ParentCategoryID`),
  ADD KEY `idx_platformcategories_name` (`Name`),
  ADD KEY `idx_platformcategories_slug` (`Slug`);

--
-- Chỉ mục cho bảng `ProductImages`
--
ALTER TABLE `ProductImages`
  ADD PRIMARY KEY (`ImageID`),
  ADD KEY `idx_productimages_product_id` (`ProductID`);

--
-- Chỉ mục cho bảng `ProductReviews`
--
ALTER TABLE `ProductReviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD UNIQUE KEY `uq_productreview_user_product_order` (`UserID`,`ProductID`,`OrderID`),
  ADD KEY `OrderID` (`OrderID`),
  ADD KEY `idx_productreviews_product_id` (`ProductID`),
  ADD KEY `idx_productreviews_user_id` (`UserID`);

--
-- Chỉ mục cho bảng `Products`
--
ALTER TABLE `Products`
  ADD PRIMARY KEY (`ProductID`),
  ADD KEY `idx_products_name` (`Name`),
  ADD KEY `idx_products_shop_id` (`ShopID`),
  ADD KEY `idx_products_category_id` (`CategoryID`),
  ADD KEY `idx_products_admin_approval_status` (`AdminApprovalStatus`);

--
-- Chỉ mục cho bảng `ProductVariantAttribute`
--
ALTER TABLE `ProductVariantAttribute`
  ADD PRIMARY KEY (`VariantID`,`AttributeValueID`),
  ADD KEY `pvav_ibfk_2` (`AttributeValueID`);

--
-- Chỉ mục cho bảng `ProductVariants`
--
ALTER TABLE `ProductVariants`
  ADD PRIMARY KEY (`VariantID`),
  ADD UNIQUE KEY `uq_variant_sku_product` (`ProductID`,`SKU`);

--
-- Chỉ mục cho bảng `ReturnRequests`
--
ALTER TABLE `ReturnRequests`
  ADD PRIMARY KEY (`ReturnRequestID`),
  ADD KEY `OrderItemID` (`OrderItemID`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_returnrequests_order_id` (`OrderID`),
  ADD KEY `idx_returnrequests_user_id` (`UserID`),
  ADD KEY `idx_returnrequests_status` (`Status`);

--
-- Chỉ mục cho bảng `ShopFollows`
--
ALTER TABLE `ShopFollows`
  ADD PRIMARY KEY (`FollowID`),
  ADD UNIQUE KEY `uq_shopfollow_user_shop` (`UserID`,`ShopID`),
  ADD KEY `ShopID` (`ShopID`);

--
-- Chỉ mục cho bảng `Shops`
--
ALTER TABLE `Shops`
  ADD PRIMARY KEY (`ShopID`),
  ADD UNIQUE KEY `UserID` (`UserID`),
  ADD UNIQUE KEY `ShopName` (`ShopName`),
  ADD KEY `idx_shops_shopname` (`ShopName`),
  ADD KEY `idx_shops_status` (`Status`);

--
-- Chỉ mục cho bảng `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_users_email` (`Email`),
  ADD KEY `idx_users_role` (`Role`);

--
-- Chỉ mục cho bảng `UserVouchers`
--
ALTER TABLE `UserVouchers`
  ADD PRIMARY KEY (`UserVoucherID`),
  ADD UNIQUE KEY `uq_user_voucher_order` (`UserID`,`VoucherID`,`ShopID`),
  ADD KEY `VoucherID` (`VoucherID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `ShopID` (`ShopID`);

--
-- Chỉ mục cho bảng `Vouchers`
--
ALTER TABLE `Vouchers`
  ADD PRIMARY KEY (`VoucherID`),
  ADD UNIQUE KEY `Code` (`Code`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `UserID_Creator_idx` (`UserID`),
  ADD KEY `idx_vouchers_code` (`Code`),
  ADD KEY `idx_vouchers_scope_shop_id` (`Scope`,`ShopID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `Addresses`
--
ALTER TABLE `Addresses`
  MODIFY `AddressID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `Attributes`
--
ALTER TABLE `Attributes`
  MODIFY `AttributeID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `AttributeValues`
--
ALTER TABLE `AttributeValues`
  MODIFY `AttributeValueID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `banners`
--
ALTER TABLE `banners`
  MODIFY `BannerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `CartItems`
--
ALTER TABLE `CartItems`
  MODIFY `CartItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `Carts`
--
ALTER TABLE `Carts`
  MODIFY `CartID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `FlashSaleCampaigns`
--
ALTER TABLE `FlashSaleCampaigns`
  MODIFY `CampaignID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `FlashSaleDeals`
--
ALTER TABLE `FlashSaleDeals`
  MODIFY `DealID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `OrderItems`
--
ALTER TABLE `OrderItems`
  MODIFY `OrderItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `OrdersBuyer`
--
ALTER TABLE `OrdersBuyer`
  MODIFY `OrderID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `PlatformCategories`
--
ALTER TABLE `PlatformCategories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `ProductImages`
--
ALTER TABLE `ProductImages`
  MODIFY `ImageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `ProductReviews`
--
ALTER TABLE `ProductReviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `Products`
--
ALTER TABLE `Products`
  MODIFY `ProductID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `ProductVariants`
--
ALTER TABLE `ProductVariants`
  MODIFY `VariantID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `ReturnRequests`
--
ALTER TABLE `ReturnRequests`
  MODIFY `ReturnRequestID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `ShopFollows`
--
ALTER TABLE `ShopFollows`
  MODIFY `FollowID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `Shops`
--
ALTER TABLE `Shops`
  MODIFY `ShopID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `Users`
--
ALTER TABLE `Users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `UserVouchers`
--
ALTER TABLE `UserVouchers`
  MODIFY `UserVoucherID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `Vouchers`
--
ALTER TABLE `Vouchers`
  MODIFY `VoucherID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `Addresses`
--
ALTER TABLE `Addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `AttributeValues`
--
ALTER TABLE `AttributeValues`
  ADD CONSTRAINT `attributevalues_ibfk_1` FOREIGN KEY (`AttributeID`) REFERENCES `Attributes` (`AttributeID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `CartItems`
--
ALTER TABLE `CartItems`
  ADD CONSTRAINT `cartitems_ibfk_1` FOREIGN KEY (`CartID`) REFERENCES `Carts` (`CartID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cartitems_ibfk_3` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartitems_variant` FOREIGN KEY (`VariantID`) REFERENCES `ProductVariants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `Carts`
--
ALTER TABLE `Carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `FlashSaleCampaigns`
--
ALTER TABLE `FlashSaleCampaigns`
  ADD CONSTRAINT `flashsalecampaigns_ibfk_1` FOREIGN KEY (`AdminUserID`) REFERENCES `Users` (`UserID`);

--
-- Ràng buộc cho bảng `FlashSaleDeals`
--
ALTER TABLE `FlashSaleDeals`
  ADD CONSTRAINT `flashsaledeals_ibfk_1` FOREIGN KEY (`CampaignID`) REFERENCES `FlashSaleCampaigns` (`CampaignID`),
  ADD CONSTRAINT `flashsaledeals_ibfk_2` FOREIGN KEY (`VariantID`) REFERENCES `ProductVariants` (`VariantID`);

--
-- Ràng buộc cho bảng `OrderItems`
--
ALTER TABLE `OrderItems`
  ADD CONSTRAINT `fk_orderitems_flashsaledeal` FOREIGN KEY (`FlashSaleDealID`) REFERENCES `FlashSaleDeals` (`DealID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orderitems_variant` FOREIGN KEY (`VariantID`) REFERENCES `ProductVariants` (`VariantID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `OrdersBuyer` (`OrderID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `OrdersBuyer`
--
ALTER TABLE `OrdersBuyer`
  ADD CONSTRAINT `orders_buyer_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_buyer_ibfk_2` FOREIGN KEY (`ShippingAddressID`) REFERENCES `Addresses` (`AddressID`) ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `PlatformCategories`
--
ALTER TABLE `PlatformCategories`
  ADD CONSTRAINT `platformcategories_ibfk_1` FOREIGN KEY (`ParentCategoryID`) REFERENCES `PlatformCategories` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `ProductImages`
--
ALTER TABLE `ProductImages`
  ADD CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `ProductReviews`
--
ALTER TABLE `ProductReviews`
  ADD CONSTRAINT `productreviews_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productreviews_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productreviews_ibfk_3` FOREIGN KEY (`OrderID`) REFERENCES `OrdersBuyer` (`OrderID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `Products`
--
ALTER TABLE `Products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `PlatformCategories` (`CategoryID`) ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `ProductVariantAttribute`
--
ALTER TABLE `ProductVariantAttribute`
  ADD CONSTRAINT `pvav_ibfk_1` FOREIGN KEY (`VariantID`) REFERENCES `ProductVariants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pvav_ibfk_2` FOREIGN KEY (`AttributeValueID`) REFERENCES `AttributeValues` (`AttributeValueID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `ProductVariants`
--
ALTER TABLE `ProductVariants`
  ADD CONSTRAINT `productvariants_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `ReturnRequests`
--
ALTER TABLE `ReturnRequests`
  ADD CONSTRAINT `returnrequests_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `OrdersBuyer` (`OrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_2` FOREIGN KEY (`OrderItemID`) REFERENCES `OrderItems` (`OrderItemID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_3` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_4` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `ShopFollows`
--
ALTER TABLE `ShopFollows`
  ADD CONSTRAINT `shopfollows_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopfollows_ibfk_2` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `Shops`
--
ALTER TABLE `Shops`
  ADD CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `UserVouchers`
--
ALTER TABLE `UserVouchers`
  ADD CONSTRAINT `userusedvouchers_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userusedvouchers_ibfk_2` FOREIGN KEY (`VoucherID`) REFERENCES `Vouchers` (`VoucherID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userusedvouchers_ibfk_4` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `Vouchers`
--
ALTER TABLE `Vouchers`
  ADD CONSTRAINT `vouchers_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vouchers_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
