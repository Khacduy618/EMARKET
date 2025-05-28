-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: May 28, 2025 at 05:09 AM
-- Server version: 8.0.42
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `AddressID` int NOT NULL,
  `UserID` int NOT NULL,
  `FullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Street` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `District` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `City` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsDefault` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banners`
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
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cartitems`
--

CREATE TABLE `cartitems` (
  `CartItemID` int NOT NULL,
  `CartID` int NOT NULL,
  `ProductID` int NOT NULL,
  `ShopID` int NOT NULL,
  `Quantity` int NOT NULL,
  `AddedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `CartID` int NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chatmessages`
--

CREATE TABLE `chatmessages` (
  `MessageID` int NOT NULL,
  `ConversationID` int NOT NULL,
  `SenderUserID` int NOT NULL,
  `ReceiverUserID` int NOT NULL,
  `MessageContent` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `MessageType` enum('Text','Image','ProductLink') COLLATE utf8mb4_unicode_ci DEFAULT 'Text',
  `IsRead` tinyint(1) DEFAULT '0',
  `ReadAt` timestamp NULL DEFAULT NULL,
  `SentAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `ConversationID` int NOT NULL,
  `UserOneID` int NOT NULL,
  `UserTwoID` int NOT NULL,
  `LastMessageID` int DEFAULT NULL,
  `LastMessageAt` timestamp NULL DEFAULT NULL,
  `UserOneUnreadCount` int DEFAULT '0',
  `UserTwoUnreadCount` int DEFAULT '0',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `EnrollFlashSale`
--

CREATE TABLE `EnrollFlashSale` (
  `EFSID` int NOT NULL,
  `ProductID` int NOT NULL,
  `FlashSaleID` int NOT NULL,
  `Discount` decimal(5,2) NOT NULL,
  `Quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `EnrollFlashSale`
--

INSERT INTO `EnrollFlashSale` (`EFSID`, `ProductID`, `FlashSaleID`, `Discount`, `Quantity`) VALUES
(1, 1, 1, 20.00, 50),
(2, 60, 3, 15.00, 30),
(3, 56, 2, 15.00, 30),
(4, 2, 2, 15.00, 30);

-- --------------------------------------------------------

--
-- Table structure for table `FlashSale`
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
-- Dumping data for table `FlashSale`
--

INSERT INTO `FlashSale` (`FlashSaleID`, `UserID`, `StartTime`, `EndTime`, `DiscountMin`, `QuantityMin`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, '2025-05-27 20:00:00', '2025-05-27 22:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-05-27 20:24:30'),
(2, 3, '2025-05-27 23:00:00', '2025-05-28 00:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-05-27 23:20:54'),
(3, 2, '2025-05-28 07:00:00', '2025-05-28 09:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-05-27 23:22:18'),
(4, 1, '2025-05-27 23:00:00', '2025-05-28 00:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-05-27 23:20:54'),
(5, 1, '2025-05-27 23:00:00', '2025-05-28 00:00:00', 10.00, 1, 'active', '2025-05-27 20:24:30', '2025-05-27 23:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `OrderItemID` int NOT NULL,
  `ShopOrderID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int NOT NULL,
  `PriceAtPurchase` decimal(12,2) NOT NULL,
  `Subtotal` decimal(14,2) NOT NULL,
  `ReturnStatus` enum('None','Requested','Approved','Rejected','Returned','Refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'None',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders_buyer`
--

CREATE TABLE `orders_buyer` (
  `OrderID` int NOT NULL,
  `OrderCode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `OrderDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TotalAmount` decimal(14,2) NOT NULL,
  `ShippingAddressID` int NOT NULL,
  `ShippingFullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShippingPhoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShippingStreet` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShippingWard` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ShippingDistrict` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShippingCity` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Notes` text COLLATE utf8mb4_unicode_ci,
  `PaymentMethod` enum('COD','BankTransfer','OnlineGateway') COLLATE utf8mb4_unicode_ci NOT NULL,
  `PaymentStatus` enum('Pending','Paid','Failed','Refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `OverallStatus` enum('Pending','Processing','Shipped','Delivered','Cancelled','Returned','ReturnInProgress') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `PlatformVoucherCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PlatformDiscountAmount` decimal(12,2) DEFAULT '0.00',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platformcategories`
--

CREATE TABLE `platformcategories` (
  `CategoryID` int NOT NULL,
  `Name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `ParentCategoryID` int DEFAULT NULL,
  `Slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ImageURL` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platformcategories`
--

INSERT INTO `platformcategories` (`CategoryID`, `Name`, `Description`, `ParentCategoryID`, `Slug`, `icon`, `ImageURL`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Điện thoại', 'Danh mục các loại điện thoại thông minh', NULL, 'dien-thoai', 'FaMobileAlt', '/images/categories/category_dienthoai.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:23:49'),
(2, 'Laptop', 'Các dòng laptop văn phòng, gaming, đồ họa', NULL, 'laptop', 'FaLaptop', '/images/categories/category_laptop.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:26:17'),
(3, 'Máy tính bảng', 'Danh mục máy tính bảng Apple, Samsung,...', NULL, 'may-tinh-bang', 'FaGamepad', '/images/categories/category_maytinhbang.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:27:52'),
(4, 'Phụ kiện', 'Các phụ kiện như sạc, tai nghe, ốp lưng,...', NULL, 'phu-kien', 'FaClock', '/images/categories/category_phukien.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:29:47'),
(5, 'Ốp lưng điện thoại', 'Ốp lưng các dòng điện thoại phổ biến', 4, 'op-lung-dien-thoai', 'OpLungDienThoai', '/images/categories/category_oplung.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:37:32'),
(6, 'Tai nghe', 'Tai nghe có dây và không dây', 4, 'tai-nghe', 'FaHeadphones', '/images/categories/category_tainghe.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:52:33'),
(7, 'Sạc & Cáp', 'Sạc nhanh, cáp USB-C, Lightning,...', 4, 'sac-cap', 'SacCap', '/images/categories/category_saccap.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:54:40'),
(8, 'Chuột & Bàn phím', 'Chuột, bàn phím cho PC và laptop', 4, 'chuot-ban-phim', 'OpLungDienThoai', '/images/categories/category_chuotbanjphim.png', 1, '2025-05-17 05:05:06', '2025-05-21 06:56:01'),
(10, 'Tivi & Màn hình', 'Các loại tivi, màn hình máy tính, màn hình gaming', NULL, 'tivi-man-hinh', 'FaTv', '/images/categories/category_tivi.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(11, 'Tủ lạnh', 'Tủ lạnh gia đình, tủ lạnh mini, tủ đông', NULL, 'tu-lanh', 'FaSnowflake', '/images/categories/category_tulanh.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(12, 'Máy giặt', 'Máy giặt cửa trước, cửa trên, sấy quần áo', NULL, 'may-giat', 'FaTshirt', '/images/categories/category_maygiat.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(13, 'Điều hòa', 'Điều hòa không khí các loại', NULL, 'dieu-hoa', 'FaFan', '/images/categories/category_dieuhoa.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(14, 'Đồ gia dụng', 'Các thiết bị gia dụng nhà bếp', NULL, 'do-gia-dung', 'FaUtensils', '/images/categories/category_dogiadung.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(15, 'Thiết bị âm thanh', 'Loa, dàn âm thanh, soundbar', NULL, 'thiet-bi-am-thanh', 'FaMusic', '/images/categories/category_amthanh.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(16, 'Camera & An ninh', 'Camera giám sát, thiết bị an ninh', NULL, 'camera-an-ninh', 'FaVideo', '/images/categories/category_camera.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10'),
(17, 'Thiết bị mạng', 'Router, switch, thiết bị mạng', NULL, 'thiet-bi-mang', 'FaNetworkWired', '/images/categories/category_mang.png', 1, '2025-05-21 14:24:10', '2025-05-21 14:24:10');

-- --------------------------------------------------------

--
-- Table structure for table `productimages`
--

CREATE TABLE `productimages` (
  `ImageID` int NOT NULL,
  `ProductID` int NOT NULL,
  `ImageURL` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `SortOrder` int DEFAULT '0',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productimages`
--

INSERT INTO `productimages` (`ImageID`, `ProductID`, `ImageURL`, `IsPrimary`, `SortOrder`, `CreatedAt`) VALUES
(31, 13, '/images/products/12_extra.jpg', 1, 1, '2025-05-20 09:33:23'),
(32, 57, 'https://tanphat.com.vn/media/product/2875_laptop_dell_xps_13_plus_9320_5cg57_oled.jpg', 1, 2, '2025-05-20 09:33:23'),
(33, 35, 'https://theson.vn/wp-content/uploads/2024/10/samsung-galaxy-s21-fe-5g-8gb-128gb-chinh-hang.jpg', 1, 3, '2025-05-20 09:33:23'),
(34, 37, 'https://tanphat.com.vn/media/product/2875_laptop_dell_xps_13_plus_9320_5cg57_oled.jpg', 1, 3, '2025-05-20 09:33:23'),
(36, 11, 'https://soundmax.com.vn/images/2022/a-180-1a.jpg', 1, 1, '2025-05-21 01:54:17'),
(37, 60, 'https://bizweb.dktcdn.net/100/435/502/products/1-a8de5f9b-0804-41be-814f-290133b86f96.jpg?v=1664270814250', 0, 2, '2025-05-21 01:54:17'),
(38, 12, 'https://bizweb.dktcdn.net/100/479/913/products/tai-nghe-sony-wh-1000xm4-15.jpg?v=1681896574183', 1, 1, '2025-05-21 01:54:17'),
(39, 12, '/images/products/12_extra.jpg', 0, 2, '2025-05-21 01:54:17'),
(41, 13, '/images/products/13_extra.jpg', 0, 2, '2025-05-21 01:54:17'),
(43, 14, '/images/products/14_extra.jpg', 0, 2, '2025-05-21 01:54:17'),
(44, 15, 'https://2tmobile.com/wp-content/uploads/2022/04/Mouse-Microsoft-Bluetooth-ErgonomicMouse-trang.png', 1, 1, '2025-05-21 01:54:17'),
(47, 16, '/images/products/16_extra.jpg', 0, 2, '2025-05-21 01:54:18'),
(49, 19, '/images/products/19_extra.jpg', 0, 2, '2025-05-21 01:54:18'),
(50, 60, 'https://bizweb.dktcdn.net/100/435/502/products/1-a8de5f9b-0804-41be-814f-290133b86f96.jpg?v=1664270814250', 1, 1, '2025-05-20 09:33:23'),
(51, 56, 'https://www.maccenter.vn/Headphone/Sony-1000XM4-Blue-A.jpg', 1, 1, '2025-05-20 09:33:23'),
(52, 55, 'https://product.hstatic.net/200000373523/product/10048374-dien-thoai-samsung-galaxy-s21-8gb-128gb-den-1_302c467c172a4d188c441e2e15f45e85_grande.jpg', 1, 1, '2025-05-20 09:33:23'),
(53, 2, 'https://store.sony.com.vn/cdn/shop/products/WHM4.png?v=1694056028', 1, 1, '2025-05-20 09:33:23'),
(54, 38, 'https://bizweb.dktcdn.net/100/085/471/files/3-0b0e51e7-54b4-457f-bfa9-57d4bb7aa681.jpg?v=1637834785641', 1, 1, '2025-05-20 09:33:23'),
(55, 1001, 'images/products/category_tainghe.png', 1, 1, '2025-05-20 09:33:23'),
(56, 1, 'images/products/category_tainghe.png', 1, 1, '2025-05-20 09:33:23');

-- --------------------------------------------------------

--
-- Table structure for table `productreviews`
--

CREATE TABLE `productreviews` (
  `ReviewID` int NOT NULL,
  `ProductID` int NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `ShopOrderID` int DEFAULT NULL,
  `Rating` tinyint NOT NULL,
  `Comment` text COLLATE utf8mb4_unicode_ci,
  `ReviewImages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `IsApproved` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductID` int NOT NULL,
  `ShopID` int NOT NULL,
  `CategoryID` int NOT NULL,
  `Name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `SKU` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Price` decimal(12,2) NOT NULL,
  `discount` int NOT NULL,
  `StockQuantity` int NOT NULL DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `AdminApprovalStatus` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `ReasonForRejection` text COLLATE utf8mb4_unicode_ci,
  `AverageRating` float DEFAULT '0',
  `ViewCount` int DEFAULT '0',
  `SoldCount` int DEFAULT '0',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`ProductID`, `ShopID`, `CategoryID`, `Name`, `Description`, `SKU`, `Price`, `discount`, `StockQuantity`, `IsActive`, `AdminApprovalStatus`, `ReasonForRejection`, `AverageRating`, `ViewCount`, `SoldCount`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 1, 'iPhone Test', NULL, NULL, 10000000.00, 0, 0, 1, 'Approved', NULL, 0, 0, 0, '2025-05-23 16:13:52', '2025-05-23 16:13:52'),
(2, 1, 4, 'mua em di', NULL, NULL, 10000000.00, 0, 0, 1, 'Approved', NULL, 0, 0, 0, '2025-05-23 16:13:52', '2025-05-23 16:13:52'),
(3, 1, 1, 'iPhone Test', NULL, NULL, 10000000.00, 0, 0, 1, 'Approved', NULL, 0, 0, 0, '2025-05-24 07:42:20', '2025-05-24 07:42:20'),
(11, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 'SKU12345', 15000000.00, 0, 50, 1, 'Approved', NULL, 4.5, 200, 30, '2025-05-17 05:42:20', '2025-05-17 05:42:20'),
(12, 1, 3, 'Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn hàng đầu của Sony', 'SKU12346', 6000000.00, 0, 100, 1, 'Pending', NULL, 4.7, 150, 45, '2025-05-17 05:42:20', '2025-05-17 05:42:20'),
(13, 2, 1, 'Laptop Dell XPS 13', 'Laptop cao cấp cấu hình mạnh', 'SKU12347', 32000000.00, 0, 20, 1, 'Approved', NULL, 4.8, 300, 70, '2025-05-17 05:42:20', '2025-05-17 05:42:20'),
(14, 2, 4, 'Bàn phím cơ Logitech G Pro', 'Bàn phím gaming cơ chất lượng cao', 'SKU12348', 2500000.00, 20, 75, 1, 'Rejected', 'Chưa đạt tiêu chuẩn kiểm tra', 4.2, 50, 10, '2025-05-17 05:42:20', '2025-05-22 16:51:08'),
(15, 3, 5, 'Chuột không dây Microsoft', 'Chuột không dây tiện dụng', 'SKU12349', 800000.00, 0, 120, 1, 'Approved', NULL, 4, 90, 25, '2025-05-17 05:42:20', '2025-05-17 05:42:20'),
(16, 1, 2, 'Điện thoại Samsung Galaxy S2111111111111', 'Smartphone cao cấp của Samsung', 'SKU123456789', 15000000.00, 0, 50, 1, 'Approved', NULL, 4.5, 200, 30, '2025-05-17 05:58:11', '2025-05-17 06:00:19'),
(19, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 'SKU1234sssssss5', 15000000.00, 10, 50, 1, 'Approved', NULL, 4.5, 200, 30, '2025-05-18 16:05:32', '2025-05-18 16:05:32'),
(35, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 'SKU12s345', 15000000.00, 10, 50, 1, 'Approved', NULL, 4.5, 200, 30, '2025-05-18 16:07:14', '2025-05-18 16:07:14'),
(36, 1, 3, 'Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn hàng đầu của Sony', 'ssssss223', 6000000.00, 5, 100, 1, 'Pending', NULL, 4.7, 150, 45, '2025-05-18 16:07:14', '2025-05-18 16:07:14'),
(37, 2, 1, 'Laptop Dell XPS 13', 'Laptop cao cấp cấu hình mạnh', 'SKUdđ12347', 32000000.00, 15, 20, 1, 'Approved', NULL, 4.8, 300, 70, '2025-05-18 16:07:14', '2025-05-18 16:07:14'),
(38, 2, 4, 'Bàn phím cơ Logitech G Pro', 'Bàn phím gaming cơ chất lượng cao', 'SKU1dd2348', 2500000.00, 10, 75, 1, 'Rejected', 'Chưa đạt tiêu chuẩn kiểm tra', 4.2, 50, 10, '2025-05-18 16:07:14', '2025-05-22 16:50:34'),
(39, 3, 5, 'Chuột không dây Microsoft', 'Chuột không dây tiện dụng', 'SKU12349NEW', 800000.00, 0, 120, 1, 'Approved', NULL, 4, 90, 25, '2025-05-18 16:07:14', '2025-05-18 16:07:14'),
(55, 1, 2, 'Điện thoại Samsung Galaxy S21', 'Smartphone cao cấp của Samsung', 'SKs12s345', 15000000.00, 10, 50, 1, 'Approved', NULL, 4.5, 200, 30, '2025-05-18 16:20:08', '2025-05-18 16:20:08'),
(56, 1, 3, 'Tai nghe Bluetooth Sony WH-1000XM4', 'Tai nghe chống ồn hàng đầu của Sony', 'ss2sss223', 6000000.00, 5, 100, 1, 'Pending', NULL, 4.7, 150, 45, '2025-05-18 16:20:08', '2025-05-18 16:20:08'),
(57, 2, 1, 'Laptop Dell XPS 13', 'Laptop cao cấp cấu hình mạnh', 'SKUdđe2347', 32000000.00, 15, 20, 1, 'Approved', NULL, 4.8, 300, 70, '2025-05-18 16:20:08', '2025-05-18 16:20:08'),
(58, 2, 4, 'Bàn phím cơ Logitech G Pro', 'Bàn phím gaming cơ chất lượng cao', 'SKU1dd2348-new', 2500000.00, 0, 75, 1, 'Rejected', 'Chưa đạt tiêu chuẩn kiểm tra', 4.2, 50, 10, '2025-05-18 16:20:08', '2025-05-18 16:20:08'),
(59, 3, 5, 'Chuột không dây Microsoft', 'Chuột không dây tiện dụng', 'SKU12349NEW2', 800000.00, 0, 120, 1, 'Approved', NULL, 4.3, 80, 25, '2025-05-18 16:20:08', '2025-05-18 16:20:08'),
(60, 1, 1, 'Điện thoại Samsung Galaxy S21', 'Mô tả sản phẩm Samsung Galaxy S21', 'SGS21-001', 15000000.00, 10, 100, 1, 'Approved', NULL, 0, 0, 0, '2025-05-23 16:05:02', '2025-05-23 16:05:02'),
(1001, 1, 1, 'iPhone 15 Pro Max', NULL, NULL, 9999000.00, 10, 0, 1, 'Approved', NULL, 0, 0, 0, '2025-05-24 16:29:41', '2025-05-24 16:29:41');

-- --------------------------------------------------------

--
-- Table structure for table `returnrequests`
--

CREATE TABLE `returnrequests` (
  `ReturnRequestID` int NOT NULL,
  `ShopOrderID` int NOT NULL,
  `OrderItemID` int DEFAULT NULL,
  `UserID_Buyer` int NOT NULL,
  `ShopID` int NOT NULL,
  `RequestType` enum('Return','Refund','ReturnAndRefund') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ReasonCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ReasonDescription` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `EvidenceURLs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `Status` enum('PendingSellerApproval','SellerApproved_WaitForReturn','SellerReceivedProduct','RefundProcessing','Refunded','SellerRejected','BuyerCancelled','AdminIntervention','Closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingSellerApproval',
  `SellerNote` text COLLATE utf8mb4_unicode_ci,
  `AdminNote` text COLLATE utf8mb4_unicode_ci,
  `ResolutionType` enum('FullRefund','PartialRefund','ProductExchange','NoAction','StoreCredit') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `RefundAmount` decimal(12,2) DEFAULT NULL,
  `BuyerShippingInfoForReturn` text COLLATE utf8mb4_unicode_ci,
  `ShopShippingInfoForReturn` text COLLATE utf8mb4_unicode_ci,
  `RequestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `shopfollows`
--

CREATE TABLE `shopfollows` (
  `FollowID` int NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `ShopID` int NOT NULL,
  `FollowedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shoporders`
--

CREATE TABLE `shoporders` (
  `ShopOrderID` int NOT NULL,
  `OrderID` int NOT NULL,
  `ShopID` int NOT NULL,
  `ShopOrderCode` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SubtotalForShop` decimal(12,2) NOT NULL,
  `ShippingFeeForShop` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ShopVoucherCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ShopDiscountAmount` decimal(12,2) DEFAULT '0.00',
  `TotalAmountForShop` decimal(12,2) NOT NULL,
  `ShopOrderStatus` enum('PendingConfirmation','Processing','ReadyToShip','Shipped','Delivered','CancelledBySeller','CancelledByBuyer','Returned','ReturnRequested','ReturnApproved','ReturnRejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingConfirmation',
  `EstimatedDeliveryDate` date DEFAULT NULL,
  `TrackingNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ShippingProvider` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shopreviews`
--

CREATE TABLE `shopreviews` (
  `ReviewID` int NOT NULL,
  `ShopID` int NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `ShopOrderID` int DEFAULT NULL,
  `Rating` tinyint NOT NULL,
  `Comment` text COLLATE utf8mb4_unicode_ci,
  `IsApproved` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `ShopID` int NOT NULL,
  `UserID_Owner` int NOT NULL,
  `ShopName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `LogoURL` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CoverImageURL` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ShopAddress` text COLLATE utf8mb4_unicode_ci,
  `ShopPhone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AverageRating` float DEFAULT '0',
  `Status` enum('PendingApproval','Approved','Suspended','Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PendingApproval',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`ShopID`, `UserID_Owner`, `ShopName`, `Description`, `LogoURL`, `CoverImageURL`, `ShopAddress`, `ShopPhone`, `AverageRating`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Shop A', 'Cửa hàng điện thoại chính hãng', NULL, NULL, '123 Đường A, Thành phố B', '0123456789', 4.5, 'Approved', '2025-05-17 05:40:01', '2025-05-17 05:41:57'),
(2, 2, 'Shop B', 'Chuyên bán phụ kiện điện thoại', NULL, NULL, '456 Đường C, Thành phố D', '0987654321', 4.2, 'PendingApproval', '2025-05-17 05:40:01', '2025-05-17 05:42:00'),
(3, 3, 'Shop C', 'Cửa hàng laptop và phụ kiện', NULL, NULL, '789 Đường E, Thành phố F', '0112233445', 4.8, 'Approved', '2025-05-17 05:40:01', '2025-05-17 05:42:03');

-- --------------------------------------------------------

--
-- Table structure for table `sitesettings`
--

CREATE TABLE `sitesettings` (
  `SettingKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SettingValue` text COLLATE utf8mb4_unicode_ci,
  `Description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int NOT NULL,
  `Username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FullName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DefaultShippingAddressID` int DEFAULT NULL,
  `Phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Level` enum('Đồng','Bạc','Vàng','Bạch kim','Kim cương') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Đồng',
  `Role` enum('Buyer','Seller','Admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Buyer',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Email`, `PasswordHash`, `FullName`, `DefaultShippingAddressID`, `Phone`, `Level`, `Role`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'user1', 'user1@example.com', 'hashed_password1', 'Nguyễn Văn A', NULL, '0123456789', 'Đồng', 'Seller', 1, '2025-05-17 05:39:42', '2025-05-17 05:39:42'),
(2, 'user2', 'user2@example.com', 'hashed_password2', 'Trần Thị B', NULL, '0987654321', 'Bạc', 'Seller', 1, '2025-05-17 05:39:42', '2025-05-17 05:39:42'),
(3, 'user3', 'user3@example.com', 'hashed_password3', 'Lê Văn C', NULL, '0112233445', 'Vàng', 'Seller', 1, '2025-05-17 05:39:42', '2025-05-17 05:39:42');

-- --------------------------------------------------------

--
-- Table structure for table `userusedvouchers`
--

CREATE TABLE `userusedvouchers` (
  `UserUsedVoucherID` int NOT NULL,
  `UserID` int NOT NULL,
  `VoucherID` int NOT NULL,
  `ShopOrderID` int NOT NULL,
  `TimesThisOrder` int NOT NULL DEFAULT '1',
  `UsedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

CREATE TABLE `vouchers` (
  `VoucherID` int NOT NULL,
  `Code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `DiscountType` enum('Percentage','FixedAmount') COLLATE utf8mb4_unicode_ci NOT NULL,
  `DiscountValue` decimal(10,2) NOT NULL,
  `MaxValueForPercentage` decimal(10,2) DEFAULT NULL,
  `MinOrderValue` decimal(12,2) DEFAULT '0.00',
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL,
  `UsageLimitPerUser` int DEFAULT NULL,
  `UsageLimitTotal` int DEFAULT NULL,
  `TimesUsed` int NOT NULL DEFAULT '0',
  `Scope` enum('Platform','Shop') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ShopID` int DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`AddressID`),
  ADD KEY `idx_addresses_user_id` (`UserID`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`BannerID`),
  ADD KEY `idx_banners_position_isactive` (`Position`,`IsActive`);

--
-- Indexes for table `cartitems`
--
ALTER TABLE `cartitems`
  ADD PRIMARY KEY (`CartItemID`),
  ADD UNIQUE KEY `uq_cartitem_cart_product` (`CartID`,`ProductID`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_cartitems_cart_id` (`CartID`),
  ADD KEY `idx_cartitems_product_id` (`ProductID`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`CartID`),
  ADD UNIQUE KEY `UserID_Buyer` (`UserID_Buyer`);

--
-- Indexes for table `chatmessages`
--
ALTER TABLE `chatmessages`
  ADD PRIMARY KEY (`MessageID`),
  ADD KEY `idx_chatmessages_conversation_id` (`ConversationID`),
  ADD KEY `idx_chatmessages_sender_id` (`SenderUserID`),
  ADD KEY `idx_chatmessages_receiver_id` (`ReceiverUserID`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`ConversationID`),
  ADD UNIQUE KEY `uq_conversation_users` (`UserOneID`,`UserTwoID`),
  ADD KEY `UserTwoID` (`UserTwoID`),
  ADD KEY `fk_conversations_last_message` (`LastMessageID`);

--
-- Indexes for table `EnrollFlashSale`
--
ALTER TABLE `EnrollFlashSale`
  ADD PRIMARY KEY (`EFSID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `FlashSaleID` (`FlashSaleID`);

--
-- Indexes for table `FlashSale`
--
ALTER TABLE `FlashSale`
  ADD PRIMARY KEY (`FlashSaleID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`OrderItemID`),
  ADD KEY `idx_orderitems_shop_order_id` (`ShopOrderID`),
  ADD KEY `idx_orderitems_product_id` (`ProductID`);

--
-- Indexes for table `orders_buyer`
--
ALTER TABLE `orders_buyer`
  ADD PRIMARY KEY (`OrderID`),
  ADD UNIQUE KEY `OrderCode` (`OrderCode`),
  ADD KEY `ShippingAddressID` (`ShippingAddressID`),
  ADD KEY `idx_orders_buyer_user_id` (`UserID_Buyer`),
  ADD KEY `idx_orders_buyer_order_code` (`OrderCode`),
  ADD KEY `idx_orders_buyer_status` (`OverallStatus`),
  ADD KEY `idx_orders_buyer_payment_status` (`PaymentStatus`);

--
-- Indexes for table `platformcategories`
--
ALTER TABLE `platformcategories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `Slug` (`Slug`),
  ADD KEY `ParentCategoryID` (`ParentCategoryID`),
  ADD KEY `idx_platformcategories_name` (`Name`),
  ADD KEY `idx_platformcategories_slug` (`Slug`);

--
-- Indexes for table `productimages`
--
ALTER TABLE `productimages`
  ADD PRIMARY KEY (`ImageID`),
  ADD KEY `idx_productimages_product_id` (`ProductID`);

--
-- Indexes for table `productreviews`
--
ALTER TABLE `productreviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD UNIQUE KEY `uq_productreview_user_product_order` (`UserID_Buyer`,`ProductID`,`ShopOrderID`),
  ADD KEY `ShopOrderID` (`ShopOrderID`),
  ADD KEY `idx_productreviews_product_id` (`ProductID`),
  ADD KEY `idx_productreviews_user_id` (`UserID_Buyer`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductID`),
  ADD UNIQUE KEY `uq_product_shop_sku` (`ShopID`,`SKU`),
  ADD KEY `idx_products_name` (`Name`),
  ADD KEY `idx_products_shop_id` (`ShopID`),
  ADD KEY `idx_products_category_id` (`CategoryID`),
  ADD KEY `idx_products_price` (`Price`),
  ADD KEY `idx_products_admin_approval_status` (`AdminApprovalStatus`);

--
-- Indexes for table `returnrequests`
--
ALTER TABLE `returnrequests`
  ADD PRIMARY KEY (`ReturnRequestID`),
  ADD KEY `OrderItemID` (`OrderItemID`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_returnrequests_shop_order_id` (`ShopOrderID`),
  ADD KEY `idx_returnrequests_user_id` (`UserID_Buyer`),
  ADD KEY `idx_returnrequests_status` (`Status`);

--
-- Indexes for table `shopfollows`
--
ALTER TABLE `shopfollows`
  ADD PRIMARY KEY (`FollowID`),
  ADD UNIQUE KEY `uq_shopfollow_user_shop` (`UserID_Buyer`,`ShopID`),
  ADD KEY `ShopID` (`ShopID`);

--
-- Indexes for table `shoporders`
--
ALTER TABLE `shoporders`
  ADD PRIMARY KEY (`ShopOrderID`),
  ADD UNIQUE KEY `ShopOrderCode` (`ShopOrderCode`),
  ADD KEY `idx_shoporders_order_id` (`OrderID`),
  ADD KEY `idx_shoporders_shop_id` (`ShopID`),
  ADD KEY `idx_shoporders_status` (`ShopOrderStatus`);

--
-- Indexes for table `shopreviews`
--
ALTER TABLE `shopreviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD UNIQUE KEY `uq_shopreview_user_shop_order` (`UserID_Buyer`,`ShopID`,`ShopOrderID`),
  ADD KEY `ShopOrderID` (`ShopOrderID`),
  ADD KEY `idx_shopreviews_shop_id` (`ShopID`),
  ADD KEY `idx_shopreviews_user_id` (`UserID_Buyer`);

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`ShopID`),
  ADD UNIQUE KEY `UserID_Owner` (`UserID_Owner`),
  ADD UNIQUE KEY `ShopName` (`ShopName`),
  ADD KEY `idx_shops_shopname` (`ShopName`),
  ADD KEY `idx_shops_status` (`Status`);

--
-- Indexes for table `sitesettings`
--
ALTER TABLE `sitesettings`
  ADD PRIMARY KEY (`SettingKey`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_users_email` (`Email`),
  ADD KEY `idx_users_role` (`Role`),
  ADD KEY `fk_users_default_address` (`DefaultShippingAddressID`);

--
-- Indexes for table `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  ADD PRIMARY KEY (`UserUsedVoucherID`),
  ADD UNIQUE KEY `uq_user_voucher_shop_order` (`UserID`,`VoucherID`,`ShopOrderID`),
  ADD KEY `VoucherID` (`VoucherID`),
  ADD KEY `ShopOrderID` (`ShopOrderID`);

--
-- Indexes for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`VoucherID`),
  ADD UNIQUE KEY `Code` (`Code`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_vouchers_code` (`Code`),
  ADD KEY `idx_vouchers_scope_shop_id` (`Scope`,`ShopID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `AddressID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `BannerID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cartitems`
--
ALTER TABLE `cartitems`
  MODIFY `CartItemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `CartID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chatmessages`
--
ALTER TABLE `chatmessages`
  MODIFY `MessageID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `ConversationID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `EnrollFlashSale`
--
ALTER TABLE `EnrollFlashSale`
  MODIFY `EFSID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `FlashSale`
--
ALTER TABLE `FlashSale`
  MODIFY `FlashSaleID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `OrderItemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders_buyer`
--
ALTER TABLE `orders_buyer`
  MODIFY `OrderID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `platformcategories`
--
ALTER TABLE `platformcategories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `productimages`
--
ALTER TABLE `productimages`
  MODIFY `ImageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `productreviews`
--
ALTER TABLE `productreviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1002;

--
-- AUTO_INCREMENT for table `returnrequests`
--
ALTER TABLE `returnrequests`
  MODIFY `ReturnRequestID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopfollows`
--
ALTER TABLE `shopfollows`
  MODIFY `FollowID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shoporders`
--
ALTER TABLE `shoporders`
  MODIFY `ShopOrderID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopreviews`
--
ALTER TABLE `shopreviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `ShopID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  MODIFY `UserUsedVoucherID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `VoucherID` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cartitems`
--
ALTER TABLE `cartitems`
  ADD CONSTRAINT `cartitems_ibfk_1` FOREIGN KEY (`CartID`) REFERENCES `carts` (`CartID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cartitems_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cartitems_ibfk_3` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chatmessages`
--
ALTER TABLE `chatmessages`
  ADD CONSTRAINT `chatmessages_ibfk_1` FOREIGN KEY (`ConversationID`) REFERENCES `conversations` (`ConversationID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chatmessages_ibfk_2` FOREIGN KEY (`SenderUserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chatmessages_ibfk_3` FOREIGN KEY (`ReceiverUserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`UserOneID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`UserTwoID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conversations_last_message` FOREIGN KEY (`LastMessageID`) REFERENCES `chatmessages` (`MessageID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `EnrollFlashSale`
--
ALTER TABLE `EnrollFlashSale`
  ADD CONSTRAINT `enrollflashsale_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`),
  ADD CONSTRAINT `enrollflashsale_ibfk_2` FOREIGN KEY (`FlashSaleID`) REFERENCES `FlashSale` (`FlashSaleID`);

--
-- Constraints for table `FlashSale`
--
ALTER TABLE `FlashSale`
  ADD CONSTRAINT `flashsale_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON UPDATE CASCADE;

--
-- Constraints for table `orders_buyer`
--
ALTER TABLE `orders_buyer`
  ADD CONSTRAINT `orders_buyer_ibfk_1` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_buyer_ibfk_2` FOREIGN KEY (`ShippingAddressID`) REFERENCES `addresses` (`AddressID`) ON UPDATE CASCADE;

--
-- Constraints for table `platformcategories`
--
ALTER TABLE `platformcategories`
  ADD CONSTRAINT `platformcategories_ibfk_1` FOREIGN KEY (`ParentCategoryID`) REFERENCES `platformcategories` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `productimages`
--
ALTER TABLE `productimages`
  ADD CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productreviews`
--
ALTER TABLE `productreviews`
  ADD CONSTRAINT `productreviews_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productreviews_ibfk_2` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productreviews_ibfk_3` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `platformcategories` (`CategoryID`) ON UPDATE CASCADE;

--
-- Constraints for table `returnrequests`
--
ALTER TABLE `returnrequests`
  ADD CONSTRAINT `returnrequests_ibfk_1` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_2` FOREIGN KEY (`OrderItemID`) REFERENCES `orderitems` (`OrderItemID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_3` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_4` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shopfollows`
--
ALTER TABLE `shopfollows`
  ADD CONSTRAINT `shopfollows_ibfk_1` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopfollows_ibfk_2` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shoporders`
--
ALTER TABLE `shoporders`
  ADD CONSTRAINT `shoporders_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `orders_buyer` (`OrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shoporders_ibfk_2` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON UPDATE CASCADE;

--
-- Constraints for table `shopreviews`
--
ALTER TABLE `shopreviews`
  ADD CONSTRAINT `shopreviews_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopreviews_ibfk_2` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopreviews_ibfk_3` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `shops`
--
ALTER TABLE `shops`
  ADD CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`UserID_Owner`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_default_address` FOREIGN KEY (`DefaultShippingAddressID`) REFERENCES `addresses` (`AddressID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  ADD CONSTRAINT `userusedvouchers_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userusedvouchers_ibfk_2` FOREIGN KEY (`VoucherID`) REFERENCES `vouchers` (`VoucherID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userusedvouchers_ibfk_3` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD CONSTRAINT `vouchers_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
