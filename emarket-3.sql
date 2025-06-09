-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: db:3306
-- Thời gian đã tạo: Th5 29, 2025 lúc 01:34 PM
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
(4, 'Bộ nhớ trong (ROM)', '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(5, 'Loại Switch Bàn Phím', '2025-05-29 13:12:38', '2025-05-29 13:12:47'),
(6, 'Chiều dài Cáp', '2025-05-29 13:12:38', '2025-05-29 13:12:50'),
(7, 'Chất liệu', '2025-05-29 13:12:38', '2025-05-29 13:12:53'),
(8, 'CPU', '2025-05-29 13:12:38', '2025-05-29 13:12:56'),
(9, 'Card Đồ Họa (GPU)', '2025-05-29 13:12:38', '2025-05-29 13:12:58'),
(10, 'Hệ điều hành', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(11, 'Loại màn hình', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(12, 'Tần số quét màn hình', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(13, 'Kết nối (Interface)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(14, 'Kiểu dáng', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(15, 'Mùa', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(16, 'Thương hiệu', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(17, 'Độ phân giải màn hình', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(18, 'Loại tai nghe', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(19, 'Công nghệ sạc', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(20, 'DPI Chuột', '2025-05-29 06:30:00', '2025-05-29 06:30:00');

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
(27, 2, '38 (EU)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(28, 2, '39 (EU)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(29, 2, '40 (EU)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(30, 2, '41 (EU)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(31, 2, '42 (EU)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(32, 2, 'Free Size', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(33, 2, '29 inches', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(34, 2, '30 inches', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(35, 2, '31 inches', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(36, 2, '32 inches', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(37, 2, '13 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(38, 2, '14 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(39, 2, '15.6 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(40, 2, '17.3 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(41, 2, '24 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(42, 2, '27 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(43, 2, '32 inch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(44, 3, '6GB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(45, 3, '12GB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(46, 4, '2TB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(47, 5, 'Red Switch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(48, 5, 'Blue Switch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(49, 5, 'Brown Switch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(50, 5, 'Black Switch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(51, 5, 'Optical Switch', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(52, 6, '1m', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(53, 6, '1.5m', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(54, 6, '1.8m', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(55, 6, '2m', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(56, 7, 'Cotton', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(57, 7, 'Polyester', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(58, 7, 'Da PU', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(59, 7, 'Nhôm', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(60, 7, 'Nhựa ABS', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(61, 7, 'Kính cường lực', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(62, 7, 'Vải Canvas', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(63, 7, 'Thép không gỉ', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(64, 7, 'Denim', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(65, 8, 'Intel Core i3', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(66, 8, 'Intel Core i5', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(67, 8, 'Intel Core i7', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(68, 8, 'Intel Core i9', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(69, 8, 'AMD Ryzen 3', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(70, 8, 'AMD Ryzen 5', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(71, 8, 'AMD Ryzen 7', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(72, 8, 'Apple M1', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(73, 8, 'Apple M2', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(74, 8, 'Apple M3', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(75, 9, 'NVIDIA GeForce RTX 3050', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(76, 9, 'NVIDIA GeForce RTX 3060', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(77, 9, 'NVIDIA GeForce RTX 4050', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(78, 9, 'NVIDIA GeForce RTX 4060', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(79, 9, 'AMD Radeon RX 6600', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(80, 9, 'AMD Radeon RX 7600', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(81, 9, 'Intel Iris Xe Graphics', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(82, 9, 'Intel Arc A380', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(83, 10, 'Android 13', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(84, 10, 'Android 14', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(85, 10, 'iOS 16', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(86, 10, 'iOS 17', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(87, 10, 'Windows 11 Home', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(88, 10, 'Windows 11 Pro', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(89, 10, 'macOS Ventura', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(90, 10, 'macOS Sonoma', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(91, 10, 'Wear OS', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(92, 11, 'IPS LCD', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(93, 11, 'OLED', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(94, 11, 'AMOLED', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(95, 11, 'Retina Display', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(96, 11, 'Dynamic AMOLED 2X', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(97, 11, 'Super Retina XDR', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(98, 12, '60Hz', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(99, 12, '90Hz', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(100, 12, '120Hz', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(101, 12, '144Hz', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(102, 12, '165Hz', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(103, 13, 'USB-C', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(104, 13, 'Bluetooth 5.0', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(105, 13, 'Bluetooth 5.2', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(106, 13, 'Bluetooth 5.3', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(107, 13, 'Wi-Fi 5', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(108, 13, 'Wi-Fi 6', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(109, 13, 'Wi-Fi 6E', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(110, 13, 'NFC', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(111, 13, 'Lightning', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(112, 13, 'Micro USB', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(113, 13, 'HDMI', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(114, 13, 'DisplayPort', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(115, 13, 'USB 2.4GHz Wireless Dongle', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(116, 14, 'Slim-fit', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(117, 14, 'Regular-fit', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(118, 14, 'Oversize', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(119, 14, 'Sneaker', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(120, 14, 'Boot', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(121, 14, 'Low-profile', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(122, 14, 'Gaming', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(123, 14, 'Ergonomic', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(124, 15, 'Xuân-Hè', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(125, 15, 'Thu-Đông', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(126, 15, 'Quanh năm', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(127, 16, 'Samsung', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(128, 16, 'Apple', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(129, 16, 'Dell', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(130, 16, 'Sony', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(131, 16, 'Nike', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(132, 16, 'Adidas', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(133, 16, 'Uniqlo', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(134, 16, 'Logitech', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(135, 16, 'Asus', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(136, 16, 'Xiaomi', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(137, 16, 'HP', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(138, 16, 'Lenovo', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(139, 16, 'Oppo', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(140, 16, 'Anker', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(141, 17, 'HD (1366x768)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(142, 17, 'Full HD (1920x1080)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(143, 17, 'QHD (2560x1440)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(144, 17, '4K UHD (3840x2160)', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(145, 18, 'In-ear', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(146, 18, 'On-ear', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(147, 18, 'Over-ear', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(148, 18, 'True Wireless', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(149, 19, 'Sạc nhanh 18W', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(150, 19, 'Sạc nhanh 25W', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(151, 19, 'Sạc nhanh 33W', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(152, 19, 'Sạc nhanh 67W', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(153, 19, 'Sạc không dây Qi', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(154, 20, '800-1600 DPI', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(155, 20, '1600-3200 DPI', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(156, 20, '3200-8000 DPI', '2025-05-29 06:30:00', '2025-05-29 06:30:00'),
(157, 20, 'Trên 8000 DPI', '2025-05-29 06:30:00', '2025-05-29 06:30:00');

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
(7, 'Phụ kiện điện thoại', 'Ốp lưng, sạc, cáp, tai nghe...', 2, 'phu-kien-dien-thoai', '/images/categories/phone_accessories.png', 1, '2025-05-29 07:59:17', '2025-05-29 07:59:17'),
(8, 'Phụ kiện Máy Tính', 'Chuột, bàn phím, tai nghe máy tính, webcam, v.v.', 3, 'phu-kien-may-tinh', '/images/categories/pc_accessories.png', 1, '2025-05-29 06:30:00', '2025-05-29 06:30:00');

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
(4, 1, 5, 'Laptop UltraBook Y Slim', 'Laptop mỏng nhẹ UltraBook Y Slim, Intel Core i7 thế hệ 13, RAM 16GB, SSD 512GB.', 7, 1, 'Pending', NULL, '2025-05-29 08:02:54', '2025-05-29 08:02:54'),
(5, 1, 6, 'Smartphone Gamma G7', 'Smartphone Gamma G7, chip MediaTek Dimensity 1200, màn hình AMOLED 120Hz, camera 64MP.', 10, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(6, 1, 3, 'Laptop Gaming Titan X', 'Laptop Gaming Titan X, Intel Core i7 13th Gen, RTX 4060, 16GB RAM, 1TB SSD, màn hình 15.6 inch QHD 165Hz.', 8, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(7, 2, 5, 'Quần Jeans Nam Regular Fit', 'Quần Jeans nam ống đứng, chất liệu denim cao cấp, màu xanh bạc.', 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(8, 1, 8, 'Chuột không dây Logitech MX Master 3S', 'Chuột công thái học Logitech MX Master 3S, cảm biến 8K DPI, cuộn MagSpeed, kết nối đa thiết bị.', 5, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(9, 1, 8, 'Bàn phím cơ Keychron K2 Pro', 'Bàn phím cơ không dây Keychron K2 Pro, QMK/VIA, Gateron Brown Switch, Hotswap.', 0, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(10, 2, 5, 'Giày Chạy Bộ Nike Revolution 7', 'Giày chạy bộ Nike Revolution 7, êm ái và linh hoạt cho mọi cự ly.', 15, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(11, 1, 7, 'Sạc dự phòng Anker PowerCore 20000mAh', 'Sạc dự phòng Anker PowerCore dung lượng lớn 20000mAh, công nghệ PowerIQ, 2 cổng USB.', 10, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00'),
(12, 1, 3, 'Màn hình Dell UltraSharp U2723QE', 'Màn hình Dell 27 inch 4K UHD, IPS Black, USB-C Hub, chuyên đồ họa.', 7, 1, 'Approved', NULL, '2025-05-29 06:31:00', '2025-05-29 06:31:00');

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
(20, 1),
(21, 1),
(3, 2),
(6, 2),
(19, 2),
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
(14, 20),
(18, 29),
(19, 30),
(12, 34),
(13, 36),
(10, 39),
(11, 40),
(21, 42),
(1, 45),
(9, 45),
(11, 46),
(17, 47),
(16, 49),
(5, 56),
(12, 64),
(13, 64),
(10, 67),
(11, 68),
(10, 78),
(11, 78),
(8, 84),
(9, 84),
(1, 86),
(10, 88),
(11, 88),
(21, 92),
(1, 94),
(8, 94),
(9, 94),
(21, 98),
(1, 100),
(8, 100),
(9, 100),
(10, 102),
(11, 102),
(1, 103),
(16, 103),
(17, 103),
(20, 103),
(1, 106),
(14, 106),
(15, 106),
(16, 106),
(17, 106),
(1, 109),
(1, 110),
(21, 113),
(21, 114),
(5, 117),
(12, 117),
(13, 117),
(18, 119),
(19, 119),
(14, 123),
(15, 123),
(5, 126),
(12, 126),
(13, 126),
(18, 126),
(19, 126),
(1, 128),
(21, 129),
(18, 131),
(19, 131),
(5, 133),
(12, 133),
(13, 133),
(14, 134),
(15, 134),
(16, 134),
(17, 134),
(10, 135),
(11, 135),
(8, 136),
(9, 136),
(20, 140),
(10, 143),
(11, 143),
(21, 144),
(20, 149),
(8, 150),
(9, 151),
(14, 157),
(15, 157);

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
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `ProductID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `ProductVariants`
--
ALTER TABLE `ProductVariants`
  MODIFY `VariantID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
