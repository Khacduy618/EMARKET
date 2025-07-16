-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: db:3306
-- Thời gian đã tạo: Th6 20, 2025 lúc 08:20 AM
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
-- Cơ sở dữ liệu: `ecommerce`
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
(4, 'Bộ nhớ trong (ROM)', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(5, 'Mùa', '2025-05-29 06:30:00', '2025-06-02 05:26:45');

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
(19, 4, '1TB', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(20, 1, 'Xám Titan', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(21, 1, 'Bạc Sterling', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(22, 1, 'Xanh Rêu', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(23, 1, 'Tím Lavender', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(24, 1, 'Cam San Hô', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(25, 1, 'Nâu Chocolate', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(26, 1, 'Đỏ Burgundy', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(44, 3, '6GB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(45, 3, '12GB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(46, 4, '2TB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(124, 5, 'Xuân-Hè', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(125, 5, 'Thu-Đông', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(126, 5, 'Quanh năm', '2025-05-29 06:30:00', '2025-05-29 06:30:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banners`
--

CREATE TABLE `banners` (
  `BannerID` int NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ImageURL` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LinkURL` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
(1, 'ĐẠI TIỆC SALE HÈ 2025', 'images/banner/Banner-chinh-hang-sieu-sale-1536x664.jpg', '/campaign/summer-mega-sale', 'homepage_carousel', 1, 1, '2025-04-03 00:00:00', '2025-07-17 23:59:59', '2025-05-29 08:19:46', '2025-06-16 05:02:42'),
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
(1, 1, 1, 1, 6, '2025-05-29 08:06:53', '2025-06-14 20:15:20'),
(3, 2, 3, 1, 1, '2025-05-29 08:06:53', '2025-05-29 08:06:53'),
(4, 2, 7, 1, 1, '2025-05-29 08:06:53', '2025-05-29 08:06:53'),
(5, 1, 4, 1, 10, '2025-06-13 22:57:26', '2025-06-19 21:25:09'),
(6, 1, 8, 1, 10, '2025-06-13 22:57:50', '2025-06-16 21:49:47'),
(7, 1, 5, 2, 3, '2025-06-13 22:59:28', '2025-06-13 22:59:28'),
(8, 1, 18, 2, 3, '2025-06-13 22:59:43', '2025-06-14 19:57:34'),
(9, 1, 3, 1, 9, '2025-06-13 23:03:03', '2025-06-18 22:00:47'),
(10, 1, 11, 1, 8, '2025-06-16 21:50:16', '2025-06-19 23:40:42'),
(11, 1, 13, 2, 1, '2025-06-16 21:50:36', '2025-06-16 21:50:36');

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
-- Cấu trúc bảng cho bảng `EnrollFlashSale`
--

CREATE TABLE `EnrollFlashSale` (
  `EFSID` int NOT NULL,
  `ProductID` int NOT NULL,
  `FlashSaleID` int NOT NULL,
  `Discount` decimal(5,2) NOT NULL,
  `Quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `EnrollFlashSale`
--

INSERT INTO `EnrollFlashSale` (`EFSID`, `ProductID`, `FlashSaleID`, `Discount`, `Quantity`) VALUES
(1, 1, 1, 20.00, 50),
(2, 60, 1, 15.00, 30),
(3, 56, 1, 15.00, 30),
(4, 2, 1, 15.00, 30),
(5, 3, 1, 15.00, 30),
(6, 57, 2, 15.00, 30),
(7, 58, 1, 15.00, 30);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `FlashSale`
--

CREATE TABLE `FlashSale` (
  `FlashSaleID` int NOT NULL,
  `UserID` int NOT NULL,
  `StartTime` datetime NOT NULL,
  `EndTime` datetime NOT NULL,
  `DiscountMin` decimal(5,2) NOT NULL,
  `QuantityMin` int NOT NULL,
  `Status` varchar(50) NOT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `FlashSale`
--

INSERT INTO `FlashSale` (`FlashSaleID`, `UserID`, `StartTime`, `EndTime`, `DiscountMin`, `QuantityMin`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, '2025-06-13 14:00:00', '2025-06-13 15:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-06-13 14:25:41'),
(2, 2, '2025-06-11 23:00:00', '2025-06-12 00:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-06-11 17:34:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_05_14_143641_create_personal_access_tokens_table', 1);

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
(4, 3, 1, 1, 27500000, 27500000, 1, NULL, 'None', '2025-05-29 08:19:46'),
(5, 4, 5, 1, 350000, 350000, 0, NULL, 'None', '2025-06-16 01:27:41'),
(6, 4, 1, 1, 14600000, 14600000, 0, NULL, 'None', '2025-06-16 01:27:41'),
(7, 5, 1, 1, 28990000, 28990000, 0, NULL, 'None', '2025-06-16 01:27:41'),
(8, 6, 3, 1, 2490000, 2490000, 0, NULL, 'None', '2025-06-16 01:27:41'),
(9, 6, 5, 1, 350000, 350000, 0, NULL, 'None', '2025-06-16 01:27:41'),
(10, 6, 9, 1, 19600000, 19600000, 0, NULL, 'None', '2025-06-16 01:27:41'),
(2001, 1001, 21, 1, 5488804, 5488804, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2002, 1001, 8, 2, 8153046, 16306092, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2003, 1001, 2, 2, 10110913, 20221826, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2004, 1002, 9, 1, 3103642, 3103642, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2005, 1002, 15, 1, 9406571, 9406571, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2006, 1002, 20, 2, 11140761, 22281522, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2007, 1003, 11, 2, 3623047, 7246094, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2008, 1003, 16, 1, 9562003, 9562003, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2009, 1003, 2, 1, 3133401, 3133401, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2010, 1003, 21, 2, 8987376, 17974752, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2011, 1004, 20, 2, 781865, 1563730, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2012, 1004, 4, 2, 5807882, 11615764, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2013, 1004, 8, 1, 4376100, 4376100, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2014, 1005, 5, 1, 2925570, 2925570, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2015, 1005, 10, 1, 8983667, 8983667, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2016, 1005, 1, 1, 1568633, 1568633, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2017, 1005, 20, 1, 14053769, 14053769, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2018, 1005, 11, 1, 2708721, 2708721, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2019, 1006, 21, 2, 11307094, 22614188, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2020, 1006, 20, 1, 14692787, 14692787, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2021, 1006, 11, 1, 5602448, 5602448, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2022, 1007, 5, 1, 11009180, 11009180, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2023, 1007, 7, 2, 11361080, 22722160, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2024, 1007, 10, 2, 13222531, 26445062, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2025, 1007, 20, 2, 3872445, 7744890, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2026, 1008, 10, 2, 2293266, 4586532, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2027, 1008, 15, 2, 13315767, 26631534, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2028, 1008, 17, 2, 10028603, 20057206, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2029, 1009, 17, 1, 6593698, 6593698, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2030, 1009, 9, 1, 10639988, 10639988, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2031, 1009, 20, 1, 1872402, 1872402, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2032, 1009, 5, 1, 13732946, 13732946, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2033, 1009, 7, 2, 13888174, 27776348, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2034, 1010, 16, 2, 2806459, 5612918, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2035, 1010, 14, 2, 2188445, 4376890, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2036, 1010, 4, 2, 1785623, 3571246, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2037, 1010, 21, 2, 12073819, 24147638, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2038, 1010, 5, 1, 9888268, 9888268, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2039, 1011, 15, 2, 2229075, 4458150, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2040, 1011, 17, 1, 11653963, 11653963, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2041, 1011, 16, 1, 4473656, 4473656, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2042, 1011, 10, 1, 8107338, 8107338, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2043, 1011, 5, 1, 1495122, 1495122, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2044, 1012, 20, 2, 7045060, 14090120, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2045, 1012, 17, 1, 3054923, 3054923, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2046, 1012, 11, 2, 10175653, 20351306, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2047, 1012, 14, 2, 13295124, 26590248, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2048, 1013, 1, 2, 3000338, 6000676, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2049, 1013, 2, 2, 1645675, 3291350, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2050, 1013, 4, 2, 5884839, 11769678, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2051, 1013, 21, 1, 14774334, 14774334, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2052, 1013, 7, 2, 4292648, 8585296, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2053, 1014, 14, 1, 12739122, 12739122, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2054, 1014, 4, 1, 10797170, 10797170, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2055, 1014, 10, 2, 1193918, 2387836, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2056, 1014, 8, 2, 7555496, 15110992, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2057, 1015, 11, 2, 7791078, 15582156, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2058, 1015, 7, 1, 8996249, 8996249, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2059, 1015, 9, 2, 14418700, 28837400, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2060, 1015, 16, 2, 14140813, 28281626, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2061, 1015, 10, 1, 14223519, 14223519, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2062, 1016, 9, 1, 5815202, 5815202, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2063, 1016, 7, 1, 4896505, 4896505, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2064, 1016, 8, 1, 13547453, 13547453, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2065, 1016, 11, 2, 5137456, 10274912, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2066, 1017, 8, 2, 3667410, 7334820, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2067, 1017, 4, 1, 8610993, 8610993, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2068, 1017, 9, 1, 11469135, 11469135, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2069, 1017, 11, 1, 13561302, 13561302, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2070, 1017, 20, 2, 13179296, 26358592, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2071, 1018, 9, 2, 7765711, 15531422, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2072, 1018, 11, 1, 11739595, 11739595, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2073, 1018, 16, 2, 12244292, 24488584, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2074, 1018, 10, 1, 10395619, 10395619, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2075, 1018, 15, 2, 9811464, 19622928, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2076, 1019, 21, 2, 4101380, 8202760, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2077, 1019, 7, 2, 13618133, 27236266, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2078, 1019, 8, 2, 7770628, 15541256, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2079, 1019, 11, 1, 2007605, 2007605, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2080, 1020, 8, 1, 13797975, 13797975, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2081, 1020, 5, 2, 11651414, 23302828, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2082, 1020, 7, 1, 14129461, 14129461, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2083, 1020, 15, 2, 14957519, 29915038, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2084, 1021, 2, 1, 7131521, 7131521, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2085, 1021, 5, 2, 4251190, 8502380, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2086, 1021, 10, 1, 13907278, 13907278, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2087, 1021, 7, 2, 2435890, 4871780, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2088, 1021, 21, 2, 9243649, 18487298, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2089, 1022, 17, 2, 3324262, 6648524, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2090, 1022, 16, 2, 9586047, 19172094, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2091, 1022, 11, 1, 7716060, 7716060, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2092, 1022, 5, 1, 2688605, 2688605, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2093, 1022, 8, 2, 4089886, 8179772, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2094, 1023, 7, 2, 3592208, 7184416, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2095, 1023, 10, 2, 1881258, 3762516, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2096, 1023, 11, 2, 9907521, 19815042, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2097, 1024, 11, 1, 1515055, 1515055, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2098, 1024, 4, 1, 7993330, 7993330, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2099, 1024, 15, 1, 10731648, 10731648, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2100, 1024, 14, 2, 9892325, 19784650, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2101, 1024, 17, 2, 11507555, 23015110, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2102, 1025, 4, 1, 6621951, 6621951, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2103, 1025, 5, 2, 9123348, 18246696, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2104, 1025, 1, 2, 13146889, 26293778, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2105, 1025, 8, 1, 9636337, 9636337, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2106, 1026, 14, 1, 11973754, 11973754, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2107, 1026, 17, 2, 4893161, 9786322, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2108, 1026, 7, 1, 3031626, 3031626, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2109, 1026, 5, 2, 3816528, 7633056, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2110, 1026, 2, 2, 3706706, 7413412, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2111, 1027, 16, 1, 8869241, 8869241, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2112, 1027, 5, 1, 8786184, 8786184, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2113, 1027, 1, 1, 14705752, 14705752, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2114, 1027, 7, 1, 14652185, 14652185, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2115, 1028, 21, 2, 4857321, 9714642, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2116, 1028, 7, 2, 6182292, 12364584, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2117, 1028, 17, 1, 1338640, 1338640, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2118, 1028, 2, 2, 5383389, 10766778, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2119, 1029, 21, 1, 13620170, 13620170, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2120, 1029, 1, 1, 2615014, 2615014, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2121, 1029, 2, 2, 11673611, 23347222, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2122, 1029, 7, 1, 6848794, 6848794, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2123, 1030, 17, 2, 14024371, 28048742, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2124, 1030, 14, 2, 13270007, 26540014, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2125, 1030, 16, 1, 1334568, 1334568, 0, NULL, 'None', '2025-06-17 00:14:43'),
(2126, 1030, 5, 2, 13276880, 26553760, 0, NULL, 'None', '2025-06-17 00:14:43');

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
(3, 'EMKFS2025003', 1, '2025-05-29 08:19:46', 27530000, 27500000, 30000, 0, 2, 'Văn Phòng An Nguyễn', '0901234561', NULL, 'COD', 'Pending', 'Pending', NULL, 0.00, '2025-05-29 08:19:46', '2025-05-29 08:19:46'),
(4, 'EMK2025004', 2, '2025-06-16 01:27:31', 14950000, 14950000, 0, 0, 3, 'Trần Thị Bích', '0901234562', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-16 01:27:31', '2025-06-16 01:29:34'),
(5, 'EMK2025005', 5, '2025-06-16 01:27:31', 28990000, 28990000, 0, 0, 4, 'Phạm Thị Dung', '0901234564', 'Giao giờ chiều', 'BankTransfer', 'Paid', 'Completed', NULL, 0.00, '2025-06-16 01:27:31', '2025-06-16 01:29:41'),
(6, 'EMK2025006', 1, '2025-06-16 01:27:31', 22500000, 22500000, 0, 0, 1, 'Nguyễn Văn An', '0901234561', 'Giao tại văn phòng', 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-16 01:27:31', '2025-06-16 01:29:45'),
(1001, 'EMK2025060101', 1, '2025-05-31 18:00:00', 42046722, 42016722, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1002, 'EMK2025060102', 1, '2025-05-31 21:00:00', 34821735, 34791735, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1003, 'EMK2025060103', 1, '2025-06-01 00:00:00', 37946250, 37916250, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1004, 'EMK2025060201', 1, '2025-06-01 18:00:00', 17585594, 17555594, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1005, 'EMK2025060202', 1, '2025-06-01 21:00:00', 30270360, 30240360, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1006, 'EMK2025060203', 1, '2025-06-02 00:00:00', 42939423, 42909423, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1007, 'EMK2025060301', 1, '2025-06-02 18:00:00', 67951292, 67921292, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1008, 'EMK2025060302', 1, '2025-06-02 21:00:00', 51305272, 51275272, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1009, 'EMK2025060303', 1, '2025-06-03 00:00:00', 60645382, 60615382, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1010, 'EMK2025060401', 1, '2025-06-03 18:00:00', 47626960, 47596960, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1011, 'EMK2025060402', 1, '2025-06-03 21:00:00', 30218229, 30188229, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1012, 'EMK2025060403', 1, '2025-06-04 00:00:00', 64116597, 64086597, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1013, 'EMK2025060501', 1, '2025-06-04 18:00:00', 44451334, 44421334, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1014, 'EMK2025060502', 1, '2025-06-04 21:00:00', 41065120, 41035120, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1015, 'EMK2025060503', 1, '2025-06-05 00:00:00', 95950950, 95920950, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1016, 'EMK2025060601', 1, '2025-06-05 18:00:00', 34564072, 34534072, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1017, 'EMK2025060602', 1, '2025-06-05 21:00:00', 67364842, 67334842, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1018, 'EMK2025060603', 1, '2025-06-06 00:00:00', 81808148, 81778148, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1019, 'EMK2025060701', 1, '2025-06-06 18:00:00', 53017887, 52987887, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1020, 'EMK2025060702', 1, '2025-06-06 21:00:00', 81175302, 81145302, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1021, 'EMK2025060703', 1, '2025-06-07 00:00:00', 52930257, 52900257, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1022, 'EMK2025060801', 1, '2025-06-07 18:00:00', 44435055, 44405055, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1023, 'EMK2025060802', 1, '2025-06-07 21:00:00', 30791974, 30761974, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1024, 'EMK2025060803', 1, '2025-06-08 00:00:00', 63069793, 63039793, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1025, 'EMK2025060901', 1, '2025-06-08 18:00:00', 60828762, 60798762, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1026, 'EMK2025060902', 1, '2025-06-08 21:00:00', 39868170, 39838170, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1027, 'EMK2025060903', 1, '2025-06-09 00:00:00', 47043362, 47013362, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1028, 'EMK2025061001', 1, '2025-06-09 18:00:00', 34214644, 34184644, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1029, 'EMK2025061002', 1, '2025-06-09 21:00:00', 46461200, 46431200, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37'),
(1030, 'EMK2025061003', 1, '2025-06-10 00:00:00', 82507084, 82477084, 30000, 0, 1, 'Nguyễn Văn An', '0901234561', NULL, 'COD', 'Pending', 'Completed', NULL, 0.00, '2025-06-17 00:14:43', '2025-06-17 00:19:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'api-token', '0643cf4dfeec93301c3d0dec87b7d8a3d8d4f6652c6267c59d4e96474e93088c', '[\"*\"]', NULL, NULL, '2025-06-09 17:24:22', '2025-06-09 17:24:22'),
(2, 'App\\Models\\User', 1, 'api-token', 'c86354f8e074b7988de1e329096c90f58c07a0037b83c17a2441e5fd158dee4e', '[\"*\"]', NULL, NULL, '2025-06-09 17:24:34', '2025-06-09 17:24:34'),
(3, 'App\\Models\\User', 1, 'api-token', '37ea03cbb9ea58be822ecc922533718ee7acdb95f501aebfc03239b516eb4b63', '[\"*\"]', NULL, NULL, '2025-06-09 17:25:00', '2025-06-09 17:25:00'),
(4, 'App\\Models\\User', 1, 'api-token', 'f9beb111446dafe605bc9cc6ac59f7c35695e61f781861f39cbe50fb0b52d98c', '[\"*\"]', '2025-06-09 18:48:19', NULL, '2025-06-09 17:25:11', '2025-06-09 18:48:19'),
(5, 'App\\Models\\User', 1, 'api-token', '45488e5c9b659e5f9042aa52dc74cc2c020a08f37a5d33e4c15b39a1e144cb0a', '[\"*\"]', '2025-06-09 20:23:55', NULL, '2025-06-09 18:59:30', '2025-06-09 20:23:55'),
(6, 'App\\Models\\User', 1, 'api-token', '12db3b9358eeaed6478fc4251cb2d56faa1751ca5a210d5426d875710e695b82', '[\"*\"]', '2025-06-09 20:45:49', NULL, '2025-06-09 20:26:50', '2025-06-09 20:45:49'),
(7, 'App\\Models\\User', 1, 'api-token', 'cb7b2cf61dc726575ecdb9ceda2870b40c54a7a4e1af28d04812239fd8c75a9c', '[\"*\"]', '2025-06-11 09:09:43', NULL, '2025-06-11 08:52:23', '2025-06-11 09:09:43'),
(8, 'App\\Models\\User', 1, 'api-token', 'd3753d2e89a202733dfb346430b92d9516caffc254cbd7301bd33588f64f42b4', '[\"*\"]', '2025-06-11 09:03:02', NULL, '2025-06-11 09:02:54', '2025-06-11 09:03:02'),
(9, 'App\\Models\\User', 1, 'api-token', '5133b05821a63830076911417c5b264d9244493ba7a5b0a99f2a6c99dcac9efd', '[\"*\"]', NULL, NULL, '2025-06-11 09:10:01', '2025-06-11 09:10:01'),
(10, 'App\\Models\\User', 1, 'api-token', 'ad5a5a915227d89f43172f991496fb5c40985cbcde37d0301a404eb05c84fc9d', '[\"*\"]', NULL, NULL, '2025-06-11 09:13:12', '2025-06-11 09:13:12'),
(11, 'App\\Models\\User', 1, 'api-token', 'c93f85bd1c0a4c577f97539abc47e4504fb8ea312e7a55ffdb3e7931c1ed895c', '[\"*\"]', '2025-06-11 21:00:15', NULL, '2025-06-11 19:52:12', '2025-06-11 21:00:15'),
(12, 'App\\Models\\User', 1, 'api-token', '8f216b0ceee380aaead1ab7efd95b2cce1330fab569e2024f0b0743f70e69354', '[\"*\"]', '2025-06-14 00:12:32', NULL, '2025-06-13 19:35:04', '2025-06-14 00:12:32'),
(13, 'App\\Models\\User', 1, 'api-token', '865b738d97f92ab6b035a03a704ae297dba0e5e639c8907a9e3e6e6529ee8d8a', '[\"*\"]', '2025-06-14 00:13:58', NULL, '2025-06-14 00:13:14', '2025-06-14 00:13:58'),
(14, 'App\\Models\\User', 1, 'api-token', 'd3dfff8f69d06e607223d87c28d31d83b474fe642b55463999fc7913b96d8094', '[\"*\"]', '2025-06-14 19:03:47', NULL, '2025-06-14 00:16:08', '2025-06-14 19:03:47'),
(15, 'App\\Models\\User', 1, 'api-token', '23af295ac64d498633660af09dc6963366d43633ac541a2288c6468cb14d235e', '[\"*\"]', '2025-06-15 22:13:58', NULL, '2025-06-14 19:03:57', '2025-06-15 22:13:58'),
(16, 'App\\Models\\User', 1, 'api-token', '7c9024ec62cd948fc6a58c27bf99955e1805977fe2026eefef11bfeef854fbe8', '[\"*\"]', NULL, NULL, '2025-06-15 23:27:34', '2025-06-15 23:27:34'),
(17, 'App\\Models\\User', 1, 'api-token', '3ed91aa3a65d3e8ade4142f0019f9ea703c09d12f3018a5e69e75ad9fad2eeac', '[\"*\"]', '2025-06-16 21:50:49', NULL, '2025-06-15 23:27:35', '2025-06-16 21:50:49'),
(18, 'App\\Models\\User', 1, 'api-token', 'ad8e2dcd5a3d2d7d5ad8ba1f61272adb8b75dce23582fd736fa2bbab66c7e197', '[\"*\"]', '2025-06-16 00:15:29', NULL, '2025-06-16 00:13:40', '2025-06-16 00:15:29'),
(19, 'App\\Models\\User', 1, 'api-token', 'a059245b8ff3993bc8a041c9912b2b3a0930a49d044579cb13fd5cb4decbf074', '[\"*\"]', '2025-06-17 11:47:24', NULL, '2025-06-16 21:51:35', '2025-06-17 11:47:24'),
(20, 'App\\Models\\User', 2, 'api-token', 'af8a66fa244053055516fedb729dcd1390e58c327191277049107feef52c9da0', '[\"*\"]', '2025-06-18 21:57:33', NULL, '2025-06-18 21:50:08', '2025-06-18 21:57:33'),
(21, 'App\\Models\\User', 1, 'api-token', '9a714da66742b19a2514df193a5ab0778829d48a09358bb5d99cedcddd3ff186', '[\"*\"]', '2025-06-18 21:59:13', NULL, '2025-06-18 21:59:09', '2025-06-18 21:59:13'),
(22, 'App\\Models\\User', 1, 'api-token', 'fd0fdf966ae526fcad7f48b5972523a5b7f51d8de9c91915ecca3cd670c3e22f', '[\"*\"]', '2025-06-18 22:01:37', NULL, '2025-06-18 22:00:25', '2025-06-18 22:01:37'),
(23, 'App\\Models\\User', 1, 'api-token', '80444ea26b5d55bb733f118506eb264e2c31a438eb5246d992416523513a7aae', '[\"*\"]', '2025-06-19 23:40:43', NULL, '2025-06-19 02:18:21', '2025-06-19 23:40:43'),
(24, 'App\\Models\\User', 1, 'api-token', '0f5be7807a382c963b84ea4dc7f8be3575d1afbf4438aad4f7e2a4fa8726178e', '[\"*\"]', '2025-06-20 01:20:27', NULL, '2025-06-20 00:31:31', '2025-06-20 01:20:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `PlatformCategories`
--

CREATE TABLE `PlatformCategories` (
  `CategoryID` int NOT NULL,
  `Name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icon` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ParentCategoryID` int DEFAULT NULL,
  `Slug` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ImageURL` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Deleted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `PlatformCategories`
--

INSERT INTO `PlatformCategories` (`CategoryID`, `Name`, `Description`, `icon`, `ParentCategoryID`, `Slug`, `ImageURL`, `IsActive`, `CreatedAt`, `UpdatedAt`, `Deleted`) VALUES
(1, 'Điện Thoại - Máy Tính Bảng', 'Danh mục các loại điện thoại thông minh', 'FaMobileAlt', NULL, 'dien-thoai', '/images/categories/category_dienthoai.png', 1, '2025-05-16 22:05:06', '2025-06-10 07:49:30', 0),
(2, 'Nhà Cửa-Đời Sống', 'Các dòng laptop văn phòng, gaming, đồ họa', 'FaLaptop', NULL, 'laptop', '/images/categories/nhacuadoisong.png', 2, '2025-05-16 22:05:06', '2025-06-10 15:17:27', 0),
(3, 'Điện Gia Dụng', 'Danh mục máy tính bảng Apple, Samsung,...', 'FaGamepad', NULL, 'may-tinh-bang', '/images/categories/dogiadung.png', 3, '2025-05-16 22:05:06', '2025-06-10 15:17:34', 0),
(4, 'Làm Đẹp -Sức Khỏe', 'Các phụ kiện như sạc, tai nghe, ốp lưng,...', 'FaClock', NULL, 'phu-kien', '/images/categories/lamdepsuckhoe.png', 4, '2025-05-16 22:05:06', '2025-06-10 15:17:43', 0),
(5, 'Tai nghe', 'Tai nghe có dây và không dây', 'FaHeadphones', 1, 'tai-nghe', '/images/categories/category_tainghe.png', 1, '2025-05-16 22:05:06', '2025-06-10 14:56:57', 0),
(6, 'Ốp lưng điện thoại', 'Ốp lưng các dòng điện thoại phổ biến', 'OpLungDienThoai', 1, 'op-lung-dien-thoai', '/images/categories/category_oplung.png', 1, '2025-05-16 22:05:06', '2025-06-10 14:57:06', 0),
(8, 'Sạc & Cáp', 'Sạc nhanh, cáp USB-C, Lightning,...', 'SacCap', 1, 'sac-cap', '/images/categories/category_saccap.png', 1, '2025-05-16 22:05:06', '2025-06-10 14:57:09', 0),
(9, 'Chuột & Bàn phím', 'Chuột, bàn phím cho PC và laptop', 'OpLungDienThoai', 1, 'chuot-ban-phim', '/images/categories/category_chuotbanjphim.png', 2, '2025-05-16 22:05:06', '2025-06-10 15:37:08', 0),
(17, 'Tivi & Màn hình', 'Các loại tivi, màn hình máy tính, màn hình gaming', 'FaTv', 3, 'tivi-man-hinh', '/images/categories/category_tivi.png', 1, '2025-05-21 07:24:10', '2025-06-10 14:57:46', 0),
(18, 'Tủ lạnh', 'Tủ lạnh gia đình, tủ lạnh mini, tủ đông', 'FaSnowflake', 3, 'tu-lanh', '/images/categories/category_tulanh.png', 1, '2025-05-21 07:24:10', '2025-06-10 14:57:50', 0),
(19, 'Máy giặt', 'Máy giặt cửa trước, cửa trên, sấy quần áo', 'FaTshirt', 3, 'may-giat', '/images/categories/category_maygiat.png', 2, '2025-05-21 07:24:10', '2025-06-10 15:36:55', 0),
(20, 'Điều hòa', 'Điều hòa không khí các loại', 'FaFan', 3, 'dieu-hoa', '/images/categories/category_dieuhoa.png', 1, '2025-05-21 07:24:10', '2025-06-10 14:58:29', 0),
(21, 'Đồ gia dụng', 'Các thiết bị gia dụng nhà bếp', 'FaUtensils', 3, 'do-gia-dung', '/images/categories/category_dogiadung.png', 1, '2025-05-21 07:24:10', '2025-06-10 14:58:32', 0),
(22, 'Thiết bị âm thanh', 'Loa, dàn âm thanh, soundbar', 'FaMusic', 3, 'thiet-bi-am-thanh', '/images/categories/category_amthanh.png', 1, '2025-05-21 07:24:10', '2025-06-10 14:58:36', 0),
(23, 'Camera & An ninh', 'Camera giám sát, thiết bị an ninh', 'FaVideo', 3, 'camera-an-ninh', '/images/categories/category_camera.png', 1, '2025-05-21 07:24:10', '2025-06-10 14:58:40', 0),
(24, 'Thiết bị mạng', 'Router, switch, thiết bị mạng', 'FaNetworkWired', 2, 'thiet-bi-mang', '/images/categories/category_mang.png', 2, '2025-05-21 07:24:10', '2025-06-10 15:36:20', 0),
(27, 'Ổ Điện', 'Danh mục Ổ Điện Pích Cắm', 'FaGamepad', 2, 'may-tinh-bang1', '/images/categories/dogiadung.png', 2, '2025-05-16 22:05:06', '2025-06-10 15:36:28', 0);

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
(1, 1, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 0, '2025-05-29 08:06:53'),
(2, 2, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-3-6_2.png', 1, 1, '2025-05-29 08:06:53'),
(3, 59, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 2, '2025-05-29 08:06:53'),
(4, 60, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 0, '2025-05-29 08:06:53'),
(60, 3, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 1, '2025-05-29 08:06:53'),
(61, 2, 'https://cdn.tgdd.vn/Products/Images/54/327554/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-3-pro-r630n-xam-1-750x500.jpg', 2, 1, '2025-05-29 08:06:53'),
(62, 2, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 2, 2, '2025-05-29 08:06:53'),
(63, 7, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 2, '2025-05-29 08:06:53'),
(64, 10, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 2, '2025-05-29 08:06:53'),
(65, 5, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 0, '2025-05-29 08:06:53'),
(66, 6, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 0, '2025-05-29 08:06:53'),
(67, 7, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 2, 0, '2025-05-29 08:06:53'),
(68, 8, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 2, 0, '2025-05-29 08:06:53'),
(69, 9, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 2, 0, '2025-05-29 08:06:53'),
(70, 10, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 2, 0, '2025-05-29 08:06:53');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `viewCount` int NOT NULL DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `AdminApprovalStatus` enum('Pending','Approved','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `ReasonForRejection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Products`
--

INSERT INTO `Products` (`ProductID`, `ShopID`, `CategoryID`, `Name`, `Description`, `Discount`, `viewCount`, `IsActive`, `AdminApprovalStatus`, `ReasonForRejection`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 1, 'Smartphone X Pro Max', 'Điện thoại thông minh X Pro Max với camera 108MP, chip Snapdragon 8 Gen 3, màn hình AMOLED 120Hz.', 5, 0, 1, 'Approved', NULL, '2025-05-29 08:02:54', '2025-06-16 06:26:59'),
(2, 1, 1, 'Tai nghe không dây Z Buds 3', '    Giải phóng bản thân khỏi sự phiền nhiễu và sống trọn từng khoảnh khắc với Z Buds 3. Bạn cần sự tập trung cao độ cho công việc? Công nghệ chống ồn chủ động sẽ biến không gian của bạn thành một ốc đảo yên tĩnh. Bạn muốn tiếp thêm năng lượng cho buổi tập? Âm bass mạnh mẽ và chất âm trong trẻo sẽ là nguồn động lực bất tận. Với 8 giờ nghe nhạc không ngừng nghỉ, Z Buds 3 đảm bảo cuộc vui của bạn không bao giờ gián đoạn, từ buổi sáng tràn đầy năng lượng đến buổi tối thư giãn. Gọn nhẹ, thời trang và mạnh mẽ - Z Buds 3 không chỉ là một chiếc tai nghe, đó là tuyên ngôn về phong cách sống hiện đại và năng động của bạn.\n\nCác yếu tố bạn có thể thêm vào để mô tả chi tiết hơn:\n\n    Chất lượng âm thanh: \"Driver dynamic 11mm cho âm bass sâu lắng và dải treble trong trẻo, chi tiết.\"\n\n    Thiết kế: \"Thiết kế công thái học (ergonomic) vừa vặn hoàn hảo, mang lại cảm giác thoải mái suốt nhiều giờ liền.\"\n\n    Kết nối: \"Công nghệ Bluetooth 5.3 mới nhất cho kết nối ổn định, độ trễ gần như bằng không.\"\n\n    Kháng nước: \"Chuẩn kháng nước IPX5, sẵn sàng đồng hành cùng bạn trong mọi điều kiện thời tiết và những buổi tập luyện đẫm mồ hôi.\"\n\n    Tính năng thông minh: \"Chế độ Xuyên âm (Transparency Mode) cho phép bạn nghe được âm thanh xung quanh mà không cần tháo tai nghe.\"', 10, 0, 1, 'Approved', NULL, '2025-05-29 08:02:54', '2025-06-16 06:27:02'),
(3, 2, 1, 'Áo Thun Nam Cotton Cao Cấp', 'Áo thun nam cổ tròn, 100% cotton, co giãn 4 chiều, thấm hút mồ hôi.', 5, 0, 1, 'Approved', NULL, '2025-05-29 08:02:54', '2025-06-16 06:27:07'),
(4, 1, 1, 'Laptop UltraBook Y Slim', 'Laptop mỏng nhẹ UltraBook Y Slim, Intel Core i7 thế hệ 13, RAM 16GB, SSD 512GB.', 7, 0, 1, 'Pending', NULL, '2025-05-29 08:02:54', '2025-06-16 06:28:54'),
(5, 1, 1, 'Smartphone Gamma G7', 'Smartphone Gamma G7, chip MediaTek Dimensity 1200, màn hình AMOLED 120Hz, camera 64MP.', 10, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(6, 1, 1, 'Laptop Gaming Titan X', 'Laptop Gaming Titan X, Intel Core i7 13th Gen, RTX 4060, 16GB RAM, 1TB SSD, màn hình 15.6 inch QHD 165Hz.', 8, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(7, 2, 1, 'Quần Jeans Regular Fit', 'Quần jeans nam dáng suông, chất liệu denim cao cấp, bền đẹp.', 0, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(8, 1, 9, 'Chuột không dây Logitech MX Master 3S', 'Chuột công thái học cao cấp cho dân văn phòng và thiết kế.', 5, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(9, 1, 9, 'Bàn phím cơ Keychron K2 Pro', 'Bàn phím cơ không dây với layout 75%, hot-swappable.', 0, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(10, 2, 1, 'Giày chạy bộ Nike Revolution 7', 'Giày thể thao nhẹ, êm ái, phù hợp cho chạy bộ hàng ngày.', 10, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(11, 1, 8, 'Pin sạc dự phòng Anker PowerCore 20000', 'Sạc nhanh 20000mAh, 2 cổng USB, tương thích mọi thiết bị.', 0, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(12, 1, 17, 'Màn hình Dell UltraSharp U2723QE', 'Màn hình 27 inch 4K UHD, USB-C Hub, cho công việc và giải trí.', 5, 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-06-16 06:28:54'),
(19, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 10, 0, 1, 'Approved', NULL, '2025-05-18 09:05:32', '2025-06-16 06:28:54'),
(39, 3, 5, 'Chuột không dây Microsoft', 'Chuột không dây tiện dụng', 0, 0, 1, 'Approved', NULL, '2025-05-18 09:07:14', '2025-06-16 06:28:54'),
(55, 1, 2, 'Điện thoại Samsung Galaxy S20', 'Smartphone cao cấp của Samsung', 10, 0, 1, 'Approved', NULL, '2025-05-18 09:20:08', '2025-06-16 06:28:54'),
(56, 1, 3, 'Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn hàng đầu của Sony', 5, 0, 1, 'Pending', NULL, '2025-05-18 09:20:08', '2025-06-16 06:28:54'),
(57, 2, 1, 'Laptop Dell XPS 13', 'Laptop cao cấp cấu hình mạnh', 15, 0, 1, 'Approved', NULL, '2025-05-18 09:20:08', '2025-06-16 06:28:54'),
(58, 2, 4, 'Bàn phím cơ Logitech G Pro', 'Bàn phím gaming cơ chất lượng cao', 0, 0, 1, 'Rejected', 'Chưa đạt tiêu chuẩn kiểm tra', '2025-05-18 09:20:08', '2025-06-16 06:28:54'),
(59, 3, 5, 'Chuột không dây Microsoft', 'Chuột không dây tiện dụng', 0, 0, 1, 'Approved', NULL, '2025-05-18 09:20:08', '2025-06-16 06:28:54'),
(60, 1, 1, 'Điện thoại Samsung Galaxy S21', 'Mô tả sản phẩm Samsung Galaxy S21', 10, 0, 1, 'Approved', NULL, '2025-05-23 09:05:02', '2025-06-16 06:28:54'),
(111, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 0, 0, 1, 'Approved', NULL, '2025-05-16 22:42:20', '2025-06-16 06:28:54'),
(112, 1, 3, 'Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn hàng đầu của Sony', 0, 0, 1, 'Pending', NULL, '2025-05-16 22:42:20', '2025-06-16 06:28:54'),
(113, 2, 1, 'Laptop Dell XPS 13', 'Laptop cao cấp cấu hình mạnh', 0, 0, 1, 'Approved', NULL, '2025-05-16 22:42:20', '2025-06-16 06:28:54'),
(114, 2, 4, 'Bàn phím cơ Logitech G Pro', 'Bàn phím gaming cơ chất lượng cao', 20, 0, 1, 'Rejected', 'Chưa đạt tiêu chuẩn kiểm tra', '2025-05-16 22:42:20', '2025-06-16 06:28:54'),
(115, 3, 5, 'Chuột không dây Microsoft', 'Chuột không dây tiện dụng', 0, 0, 1, 'Approved', NULL, '2025-05-16 22:42:20', '2025-06-16 06:28:54'),
(116, 1, 2, 'Điện thoại Samsung Galaxy S2111111111111', 'Smartphone cao cấp của Samsung', 0, 0, 1, 'Approved', NULL, '2025-05-16 22:58:11', '2025-06-16 06:28:54'),
(315, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 10, 0, 1, 'Approved', NULL, '2025-05-18 09:07:14', '2025-06-16 06:28:54'),
(316, 1, 3, 'Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn hàng đầu của Sony', 5, 0, 1, 'Pending', NULL, '2025-05-18 09:07:14', '2025-06-16 06:28:54'),
(317, 2, 1, 'Laptop Dell XPS 13', 'Laptop cao cấp cấu hình mạnh', 15, 0, 1, 'Approved', NULL, '2025-05-18 09:07:14', '2025-06-16 06:28:54'),
(318, 2, 4, 'Bàn phím cơ Logitech G Pro', 'Bàn phím gaming cơ chất lượng cao', 10, 0, 1, 'Rejected', 'Chưa đạt tiêu chuẩn kiểm tra', '2025-05-18 09:07:14', '2025-06-16 06:28:54');

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
(8, 1),
(13, 1),
(15, 1),
(18, 1),
(21, 1),
(3, 2),
(19, 2),
(20, 2),
(2, 3),
(9, 3),
(12, 3),
(5, 7),
(6, 8),
(8, 12),
(7, 13),
(10, 13),
(11, 14),
(8, 16),
(1, 17),
(9, 17),
(2, 18),
(7, 18),
(10, 19),
(3, 20),
(14, 20),
(1, 45),
(9, 45),
(11, 46);

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
(3, 2, 'ZBUDS3-WHT', 2490000, 111111111, 100, '/images/variants/zbuds3_white.jpg', 1, '2025-05-29 08:02:54', '2025-06-15 16:34:47'),
(4, 2, 'ZBUDS3-BLK', 2490000, 2790000, 80, '/images/variants/zbuds3_black.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(5, 3, 'TSHIRT-COT-BLK-M', 350000, NULL, 150, '/images/variants/tshirt_cotton_black_m.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(6, 3, 'TSHIRT-COT-WHT-L', 350000, NULL, 120, '/images/variants/tshirt_cotton_white_l.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(7, 4, 'ULTRA-Y-SLV-16-512', 25990000, 27990000, 25, '/images/variants/ultray_silver.jpg', 1, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(8, 5, 'GAMMA-G7-BLK-8-128', 8990000, 9990000, 70, '/images/variants/gamma_g7_black_128.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(9, 5, 'GAMMA-G7-BLU-12-256', 10490000, 11500000, 40, '/images/variants/gamma_g7_blue_256.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(10, 6, 'TITANX-I7-4060-16-1T', 38500000, 42000000, 20, '/images/variants/titanx_16_1tb.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(11, 6, 'TITANX-I9-4070-32-2T', 48990000, 53000000, 10, '/images/variants/titanx_i9_32_2tb.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(12, 7, 'JEANS-REG-BLU-30', 650000, NULL, 90, '/images/variants/jeans_reg_blue_30.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(13, 7, 'JEANS-REG-BLK-32', 650000, NULL, 80, '/images/variants/jeans_reg_black_32.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(14, 8, 'LOGI-MXM3S-GRY', 2350000, 2490000, 60, '/images/variants/logi_mxm3s_grey.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(15, 8, 'LOGI-MXM3S-BLK', 2350000, 2490000, 55, '/images/variants/logi_mxm3s_black.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(16, 9, 'KEY-K2PRO-BRN', 3190000, NULL, 40, '/images/variants/key_k2pro_brown.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(17, 9, 'KEY-K2PRO-RED', 3190000, NULL, 35, '/images/variants/key_k2pro_red.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(18, 10, 'NIKE-REV7-BLK-40', 1590000, 1890000, 70, '/images/variants/nike_rev7_black_40.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(19, 10, 'NIKE-REV7-WHT-41', 1590000, 1890000, 65, '/images/variants/nike_rev7_white_41.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(20, 11, 'ANKER-PC20K-BLK', 990000, 1100000, 100, '/images/variants/anker_pc20k_black.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00'),
(21, 12, 'DELL-U2723QE', 13500000, 14500000, 25, '/images/variants/dell_u2723qe.jpg', 1, '2025-05-29 06:32:00', '2025-05-29 06:32:00');

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
-- Cấu trúc bảng cho bảng `shopcategories`
--

CREATE TABLE `shopcategories` (
  `ShopCategoryID` int NOT NULL,
  `ShopID` int NOT NULL,
  `CategoryID` int NOT NULL,
  `Status` enum('PendingApproval','Approved','Rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingApproval',
  `RequestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ApprovedAt` timestamp NULL DEFAULT NULL,
  `RejectedReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `shopcategories`
--

INSERT INTO `shopcategories` (`ShopCategoryID`, `ShopID`, `CategoryID`, `Status`, `RequestedAt`, `ApprovedAt`, `RejectedReason`) VALUES
(1, 1, 8, 'PendingApproval', '2025-06-18 21:51:00', NULL, NULL),
(2, 1, 6, 'PendingApproval', '2025-06-18 21:51:12', NULL, NULL),
(3, 1, 22, 'PendingApproval', '2025-06-18 21:51:17', NULL, NULL);

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
(2, 5, 'E-Style Fashion', 'Thời trang nam nữ, cập nhật xu hướng mới nhất.', '/images/logos/estyle.png', '/images/covers/estyle_cover.png', '202 Trần Hưng Đạo', 'Phường Nguyễn Cư Trinh', 'Quận 1', 'TP. Hồ Chí Minh', '0901234565', 'Thường', 'PendingApproval', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(3, 7, 'E-Style Fashion1', 'Thời trang nam nữ, cập nhật xu hướng mới nhất.', '/images/logos/estyle.png', '/images/covers/estyle_cover.png', '202 Trần Hưng Đạo', 'Phường Nguyễn Cư Trinh', 'Quận 1', 'TP. Hồ Chí Minh', '0901234565', 'Thường', 'PendingApproval', '2025-05-29 07:59:17', '2025-05-30 11:03:08');

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
  `Token` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Users`
--

INSERT INTO `Users` (`UserID`, `Username`, `Email`, `Password`, `FullName`, `Phone`, `Level`, `Role`, `IsActive`, `Token`, `CreatedAt`, `UpdatedAt`, `Avatar`) VALUES
(1, 'buyer01', 'buyer01@example.com', '$2y$10$uQw9PElApry1Za9NwivBg.ZUd2bRVQGBBQo8VTZsVFpv5.Flc1vgu', 'Nguyễn Văn An', '0901234561', 'Đồng', 'Người mua', 1, NULL, '2025-05-29 07:59:17', '2025-06-09 09:57:04', NULL),
(2, 'seller01', 'seller01@example.com', '$2y$10$u7sm2jZpoMS677kC0OfXketvfzKgK7Lp0aMXyb7KMJ9uRZnIUt5hS', 'Trần Thị Bích', '0901234562', 'Bạc', 'Người bán', 1, NULL, '2025-05-29 07:59:17', '2025-06-19 04:49:45', NULL),
(3, 'admin01', 'admin01@example.com', '$2y$10$IXgeAsSgnH27r7Eqo7DLAewYrzmhegJVlnujJcFlxpxmo9U8gh7jC', 'Lê Văn Cường (Admin)', '0901234563', 'Kim cương', 'Quản trị viên', 1, NULL, '2025-05-29 07:59:17', '2025-06-19 04:49:45', NULL),
(4, 'buyer02', 'buyer02@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Phạm Thị Dung', '0901234564', 'Đồng', 'Người mua', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17', NULL),
(5, 'seller02', 'seller02@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Hoàng Văn E', '0901234565', 'Vàng', 'Người bán', 0, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17', NULL),
(7, 'seller03', 'seller03@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Trần Thị Bích', '0901234562', 'Bạc', 'Người bán', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17', NULL),
(8, 'seller04', 'seller04@example.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Trần Thị Bích', '0901234562', 'Bạc', 'Người bán', 1, NULL, '2025-05-29 07:59:17', '2025-05-29 07:59:17', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `UserVouchers`
--

CREATE TABLE `UserVouchers` (
  `UserVoucherID` int NOT NULL,
  `UserID` int NOT NULL,
  `VoucherID` int NOT NULL,
  `ShopID` int DEFAULT NULL,
  `TimesUsedThisOrder` int NOT NULL DEFAULT '0',
  `UsedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `UserVouchers`
--

INSERT INTO `UserVouchers` (`UserVoucherID`, `UserID`, `VoucherID`, `ShopID`, `TimesUsedThisOrder`, `UsedAt`) VALUES
(1, 1, 1, NULL, 0, '2025-05-29 08:19:46'),
(2, 1, 3, NULL, 0, '2025-06-16 03:02:21'),
(3, 1, 2, 1, 0, '2025-06-16 03:02:21'),
(4, 1, 4, NULL, 0, '2025-06-16 04:31:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_chat_conversations_meta`
--

CREATE TABLE `user_chat_conversations_meta` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int NOT NULL COMMENT 'UserID của người dùng sở hữu bản ghi meta này (tham chiếu users.UserID)',
  `mongo_conversation_id` varchar(24) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID của Conversation từ MongoDB (ObjectId dạng chuỗi)',
  `other_user_id` int NOT NULL COMMENT 'UserID của người chat cùng trong cuộc trò chuyện 1-1 (tham chiếu users.UserID)',
  `other_user_username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Snapshot username của người chat cùng',
  `other_user_avatar` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Snapshot avatar của người chat cùng',
  `last_message_preview` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nội dung rút gọn của tin nhắn cuối',
  `last_message_at_mysql` timestamp NULL DEFAULT NULL COMMENT 'Thời gian của tin nhắn cuối (đồng bộ từ MongoDB)',
  `unread_count_mysql` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Số tin nhắn chưa đọc của user_id trong mongo_conversation_id này',
  `created_at_mysql` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_mysql` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ metadata tóm tắt của các cuộc trò chuyện cho từng người dùng';

--
-- Đang đổ dữ liệu cho bảng `user_chat_conversations_meta`
--

INSERT INTO `user_chat_conversations_meta` (`id`, `user_id`, `mongo_conversation_id`, `other_user_id`, `other_user_username`, `other_user_avatar`, `last_message_preview`, `last_message_at_mysql`, `unread_count_mysql`, `created_at_mysql`, `updated_at_mysql`) VALUES
(1, 1, '6854deec4151600d2b4ac946', 2, 'seller01', NULL, 'Hé lu', '2025-06-20 01:20:20', 0, '2025-06-20 04:13:42', '2025-06-20 01:20:21'),
(2, 2, '6854deec4151600d2b4ac946', 1, 'buyer01', NULL, 'Hé lu', '2025-06-20 01:20:20', 17, '2025-06-20 04:13:42', '2025-06-20 01:20:21'),
(3, 1, '6854deec4151600d2b4ac947', 5, 'seller02', NULL, 'hâhha', '2025-06-20 01:20:15', 0, '2025-06-20 04:13:42', '2025-06-20 01:20:15'),
(4, 5, '6854deec4151600d2b4ac947', 1, 'buyer01', NULL, 'hâhha', '2025-06-20 01:20:15', 2, '2025-06-20 04:13:42', '2025-06-20 01:20:15'),
(5, 4, '6854deec4151600d2b4ac945', 2, 'seller01', '/images/avatars/seller01.png', 'Tôi muốn hỏi về đơn hàng EMK2025002.', '2025-06-20 02:11:00', 0, '2025-06-20 04:13:42', '2025-06-20 04:13:42'),
(6, 2, '6854deec4151600d2b4ac945', 4, 'buyer02', '/images/avatars/buyer02.png', 'Tôi muốn hỏi về đơn hàng EMK2025002.', '2025-06-20 02:11:00', 1, '2025-06-20 04:13:42', '2025-06-20 04:13:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Vouchers`
--

CREATE TABLE `Vouchers` (
  `VoucherID` int NOT NULL,
  `Code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `VoucherType` enum('FreeShip','SaleOff') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'FreeShip',
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
  `CreatedBy` enum('Admin','Seller') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `Vouchers`
--

INSERT INTO `Vouchers` (`VoucherID`, `Code`, `Description`, `VoucherType`, `DiscountType`, `DiscountValue`, `MaxValueForPercentage`, `MinOrderValue`, `StartDate`, `EndDate`, `UsageLimitPerUser`, `UsageLimitTotal`, `TimesUsed`, `Scope`, `ShopID`, `IsActive`, `CreatedBy`, `UserID`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'WELCOME50', 'Giảm 50,000đ cho đơn hàng đầu tiên từ 200,000đ', 'SaleOff', 'FixedAmount', 50000, NULL, 200000, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 12, 1000, 0, 'Platform', NULL, 1, 'Admin', 4, '2025-05-29 08:19:46', '2025-06-16 03:27:52'),
(2, 'BICHTECH10', 'Bích Tech Store giảm 10% tối đa 100K cho đơn từ 500K', 'SaleOff', 'Percentage', 10, 100000, 500000, '2025-05-01 00:00:00', '2025-06-30 23:59:59', 12, 200, 0, 'Shop', 1, 1, 'Seller', 2, '2025-05-29 08:19:46', '2025-06-16 03:28:31'),
(3, 'FREESHIPMAX', 'Miễn phí vận chuyển tối đa 30K', 'FreeShip', 'FixedAmount', 30000, NULL, 99000, '2025-05-20 00:00:00', '2025-06-20 23:59:59', 12, 500, 0, 'Platform', NULL, 1, 'Admin', 4, '2025-05-29 08:19:46', '2025-06-16 03:27:34'),
(4, 'FREESHIP40K', 'Mã giảm 40.000đ phí vận chuyển với đơn trên 200.000đ', 'FreeShip', 'FixedAmount', 40000, NULL, 200000, '2025-06-16 04:29:01', '2025-06-25 11:29:01', 100, 20000, 0, 'Platform', NULL, 1, 'Admin', NULL, '2025-06-16 04:31:33', '2025-06-20 04:24:43');

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
-- Chỉ mục cho bảng `EnrollFlashSale`
--
ALTER TABLE `EnrollFlashSale`
  ADD PRIMARY KEY (`EFSID`),
  ADD KEY `FlashSaleID` (`FlashSaleID`);

--
-- Chỉ mục cho bảng `FlashSale`
--
ALTER TABLE `FlashSale`
  ADD PRIMARY KEY (`FlashSaleID`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

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
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

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
-- Chỉ mục cho bảng `shopcategories`
--
ALTER TABLE `shopcategories`
  ADD PRIMARY KEY (`ShopCategoryID`),
  ADD UNIQUE KEY `uq_shop_category` (`ShopID`,`CategoryID`),
  ADD KEY `CategoryID` (`CategoryID`);

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
-- Chỉ mục cho bảng `user_chat_conversations_meta`
--
ALTER TABLE `user_chat_conversations_meta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_mongo_convo` (`user_id`,`mongo_conversation_id`),
  ADD KEY `idx_meta_mongo_conversation_id` (`mongo_conversation_id`),
  ADD KEY `idx_meta_last_message_at` (`last_message_at_mysql`),
  ADD KEY `fk_meta_other_user_id_idx` (`other_user_id`);

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
  MODIFY `AttributeID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `AttributeValues`
--
ALTER TABLE `AttributeValues`
  MODIFY `AttributeValueID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=158;

--
-- AUTO_INCREMENT cho bảng `banners`
--
ALTER TABLE `banners`
  MODIFY `BannerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `CartItems`
--
ALTER TABLE `CartItems`
  MODIFY `CartItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `Carts`
--
ALTER TABLE `Carts`
  MODIFY `CartID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `OrderItems`
--
ALTER TABLE `OrderItems`
  MODIFY `OrderItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2127;

--
-- AUTO_INCREMENT cho bảng `OrdersBuyer`
--
ALTER TABLE `OrdersBuyer`
  MODIFY `OrderID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1031;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `PlatformCategories`
--
ALTER TABLE `PlatformCategories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `ProductImages`
--
ALTER TABLE `ProductImages`
  MODIFY `ImageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT cho bảng `ProductReviews`
--
ALTER TABLE `ProductReviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `Products`
--
ALTER TABLE `Products`
  MODIFY `ProductID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=319;

--
-- AUTO_INCREMENT cho bảng `ProductVariants`
--
ALTER TABLE `ProductVariants`
  MODIFY `VariantID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT cho bảng `ReturnRequests`
--
ALTER TABLE `ReturnRequests`
  MODIFY `ReturnRequestID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `shopcategories`
--
ALTER TABLE `shopcategories`
  MODIFY `ShopCategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `ShopFollows`
--
ALTER TABLE `ShopFollows`
  MODIFY `FollowID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `Shops`
--
ALTER TABLE `Shops`
  MODIFY `ShopID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `Users`
--
ALTER TABLE `Users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `UserVouchers`
--
ALTER TABLE `UserVouchers`
  MODIFY `UserVoucherID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `user_chat_conversations_meta`
--
ALTER TABLE `user_chat_conversations_meta`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `Vouchers`
--
ALTER TABLE `Vouchers`
  MODIFY `VoucherID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- Ràng buộc cho bảng `EnrollFlashSale`
--
ALTER TABLE `EnrollFlashSale`
  ADD CONSTRAINT `enrollflashsale_ibfk_1` FOREIGN KEY (`FlashSaleID`) REFERENCES `FlashSale` (`FlashSaleID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Ràng buộc cho bảng `OrderItems`
--
ALTER TABLE `OrderItems`
  ADD CONSTRAINT `fk_orderitems_flashsaledeal` FOREIGN KEY (`FlashSaleDealID`) REFERENCES `EnrollFlashSale` (`EFSID`) ON DELETE SET NULL ON UPDATE CASCADE,
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
-- Ràng buộc cho bảng `shopcategories`
--
ALTER TABLE `shopcategories`
  ADD CONSTRAINT `shopcategories_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `Shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopcategories_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `PlatformCategories` (`CategoryID`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Ràng buộc cho bảng `user_chat_conversations_meta`
--
ALTER TABLE `user_chat_conversations_meta`
  ADD CONSTRAINT `fk_meta_other_user_id` FOREIGN KEY (`other_user_id`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_meta_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

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
