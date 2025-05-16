-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th5 16, 2025 lúc 02:05 PM
-- Phiên bản máy phục vụ: 8.0.30
-- Phiên bản PHP: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `sql`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
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
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cartitems`
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
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `CartID` int NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chatmessages`
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
-- Cấu trúc bảng cho bảng `conversations`
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
-- Cấu trúc bảng cho bảng `orderitems`
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
-- Cấu trúc bảng cho bảng `orders_buyer`
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
-- Cấu trúc bảng cho bảng `platformcategories`
--

CREATE TABLE `platformcategories` (
  `CategoryID` int NOT NULL,
  `Name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `ParentCategoryID` int DEFAULT NULL,
  `Slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ImageURL` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productimages`
--

CREATE TABLE `productimages` (
  `ImageID` int NOT NULL,
  `ProductID` int NOT NULL,
  `ImageURL` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `SortOrder` int DEFAULT '0',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productreviews`
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
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `ProductID` int NOT NULL,
  `ShopID` int NOT NULL,
  `CategoryID` int NOT NULL,
  `Name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `SKU` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Price` decimal(12,2) NOT NULL,
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `returnrequests`
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
-- Cấu trúc bảng cho bảng `role`
--

CREATE TABLE `role` (
  `RoleID` int NOT NULL,
  `Description` text,
  `Permissions` varchar(300) NOT NULL,
  `Deleted` tinyint NOT NULL DEFAULT '0',
  `DeletedAt` datetime DEFAULT NULL,
  `CreateAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shopfollows`
--

CREATE TABLE `shopfollows` (
  `FollowID` int NOT NULL,
  `UserID_Buyer` int NOT NULL,
  `ShopID` int NOT NULL,
  `FollowedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shoporders`
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
-- Cấu trúc bảng cho bảng `shopreviews`
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
-- Cấu trúc bảng cho bảng `shops`
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sitesettings`
--

CREATE TABLE `sitesettings` (
  `SettingKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SettingValue` text COLLATE utf8mb4_unicode_ci,
  `Description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
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
  `RoleID` int NOT NULL DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `Token` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Deleted` tinyint NOT NULL DEFAULT '0',
  `DeletedAt` datetime NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `userusedvouchers`
--

CREATE TABLE `userusedvouchers` (
  `UserUsedVoucherID` int NOT NULL,
  `UserID` int NOT NULL,
  `VoucherID` int NOT NULL,
  `ShopOrderID` int NOT NULL,
  `TimesUsedThisOrder` int NOT NULL DEFAULT '1',
  `UsedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
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
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`AddressID`),
  ADD KEY `idx_addresses_user_id` (`UserID`);

--
-- Chỉ mục cho bảng `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`BannerID`),
  ADD KEY `idx_banners_position_isactive` (`Position`,`IsActive`);

--
-- Chỉ mục cho bảng `cartitems`
--
ALTER TABLE `cartitems`
  ADD PRIMARY KEY (`CartItemID`),
  ADD UNIQUE KEY `uq_cartitem_cart_product` (`CartID`,`ProductID`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_cartitems_cart_id` (`CartID`),
  ADD KEY `idx_cartitems_product_id` (`ProductID`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`CartID`),
  ADD UNIQUE KEY `UserID_Buyer` (`UserID_Buyer`);

--
-- Chỉ mục cho bảng `chatmessages`
--
ALTER TABLE `chatmessages`
  ADD PRIMARY KEY (`MessageID`),
  ADD KEY `idx_chatmessages_conversation_id` (`ConversationID`),
  ADD KEY `idx_chatmessages_sender_id` (`SenderUserID`),
  ADD KEY `idx_chatmessages_receiver_id` (`ReceiverUserID`);

--
-- Chỉ mục cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`ConversationID`),
  ADD UNIQUE KEY `uq_conversation_users` (`UserOneID`,`UserTwoID`),
  ADD KEY `UserTwoID` (`UserTwoID`),
  ADD KEY `fk_conversations_last_message` (`LastMessageID`);

--
-- Chỉ mục cho bảng `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`OrderItemID`),
  ADD KEY `idx_orderitems_shop_order_id` (`ShopOrderID`),
  ADD KEY `idx_orderitems_product_id` (`ProductID`);

--
-- Chỉ mục cho bảng `orders_buyer`
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
-- Chỉ mục cho bảng `platformcategories`
--
ALTER TABLE `platformcategories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `Slug` (`Slug`),
  ADD KEY `ParentCategoryID` (`ParentCategoryID`),
  ADD KEY `idx_platformcategories_name` (`Name`),
  ADD KEY `idx_platformcategories_slug` (`Slug`);

--
-- Chỉ mục cho bảng `productimages`
--
ALTER TABLE `productimages`
  ADD PRIMARY KEY (`ImageID`),
  ADD KEY `idx_productimages_product_id` (`ProductID`);

--
-- Chỉ mục cho bảng `productreviews`
--
ALTER TABLE `productreviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD UNIQUE KEY `uq_productreview_user_product_order` (`UserID_Buyer`,`ProductID`,`ShopOrderID`),
  ADD KEY `ShopOrderID` (`ShopOrderID`),
  ADD KEY `idx_productreviews_product_id` (`ProductID`),
  ADD KEY `idx_productreviews_user_id` (`UserID_Buyer`);

--
-- Chỉ mục cho bảng `products`
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
-- Chỉ mục cho bảng `returnrequests`
--
ALTER TABLE `returnrequests`
  ADD PRIMARY KEY (`ReturnRequestID`),
  ADD KEY `OrderItemID` (`OrderItemID`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_returnrequests_shop_order_id` (`ShopOrderID`),
  ADD KEY `idx_returnrequests_user_id` (`UserID_Buyer`),
  ADD KEY `idx_returnrequests_status` (`Status`);

--
-- Chỉ mục cho bảng `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`RoleID`);

--
-- Chỉ mục cho bảng `shopfollows`
--
ALTER TABLE `shopfollows`
  ADD PRIMARY KEY (`FollowID`),
  ADD UNIQUE KEY `uq_shopfollow_user_shop` (`UserID_Buyer`,`ShopID`),
  ADD KEY `ShopID` (`ShopID`);

--
-- Chỉ mục cho bảng `shoporders`
--
ALTER TABLE `shoporders`
  ADD PRIMARY KEY (`ShopOrderID`),
  ADD UNIQUE KEY `ShopOrderCode` (`ShopOrderCode`),
  ADD KEY `idx_shoporders_order_id` (`OrderID`),
  ADD KEY `idx_shoporders_shop_id` (`ShopID`),
  ADD KEY `idx_shoporders_status` (`ShopOrderStatus`);

--
-- Chỉ mục cho bảng `shopreviews`
--
ALTER TABLE `shopreviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD UNIQUE KEY `uq_shopreview_user_shop_order` (`UserID_Buyer`,`ShopID`,`ShopOrderID`),
  ADD KEY `ShopOrderID` (`ShopOrderID`),
  ADD KEY `idx_shopreviews_shop_id` (`ShopID`),
  ADD KEY `idx_shopreviews_user_id` (`UserID_Buyer`);

--
-- Chỉ mục cho bảng `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`ShopID`),
  ADD UNIQUE KEY `UserID_Owner` (`UserID_Owner`),
  ADD UNIQUE KEY `ShopName` (`ShopName`),
  ADD KEY `idx_shops_shopname` (`ShopName`),
  ADD KEY `idx_shops_status` (`Status`);

--
-- Chỉ mục cho bảng `sitesettings`
--
ALTER TABLE `sitesettings`
  ADD PRIMARY KEY (`SettingKey`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_users_email` (`Email`),
  ADD KEY `idx_users_role` (`RoleID`),
  ADD KEY `fk_users_default_address` (`DefaultShippingAddressID`);

--
-- Chỉ mục cho bảng `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  ADD PRIMARY KEY (`UserUsedVoucherID`),
  ADD UNIQUE KEY `uq_user_voucher_shop_order` (`UserID`,`VoucherID`,`ShopOrderID`),
  ADD KEY `VoucherID` (`VoucherID`),
  ADD KEY `ShopOrderID` (`ShopOrderID`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`VoucherID`),
  ADD UNIQUE KEY `Code` (`Code`),
  ADD KEY `ShopID` (`ShopID`),
  ADD KEY `idx_vouchers_code` (`Code`),
  ADD KEY `idx_vouchers_scope_shop_id` (`Scope`,`ShopID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `AddressID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `banners`
--
ALTER TABLE `banners`
  MODIFY `BannerID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cartitems`
--
ALTER TABLE `cartitems`
  MODIFY `CartItemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `CartID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chatmessages`
--
ALTER TABLE `chatmessages`
  MODIFY `MessageID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `conversations`
--
ALTER TABLE `conversations`
  MODIFY `ConversationID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `OrderItemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orders_buyer`
--
ALTER TABLE `orders_buyer`
  MODIFY `OrderID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `platformcategories`
--
ALTER TABLE `platformcategories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `productimages`
--
ALTER TABLE `productimages`
  MODIFY `ImageID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `productreviews`
--
ALTER TABLE `productreviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `ProductID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `returnrequests`
--
ALTER TABLE `returnrequests`
  MODIFY `ReturnRequestID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `role`
--
ALTER TABLE `role`
  MODIFY `RoleID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `shopfollows`
--
ALTER TABLE `shopfollows`
  MODIFY `FollowID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `shoporders`
--
ALTER TABLE `shoporders`
  MODIFY `ShopOrderID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `shopreviews`
--
ALTER TABLE `shopreviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `shops`
--
ALTER TABLE `shops`
  MODIFY `ShopID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  MODIFY `UserUsedVoucherID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `VoucherID` int NOT NULL AUTO_INCREMENT;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `cartitems`
--
ALTER TABLE `cartitems`
  ADD CONSTRAINT `cartitems_ibfk_1` FOREIGN KEY (`CartID`) REFERENCES `carts` (`CartID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cartitems_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cartitems_ibfk_3` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `chatmessages`
--
ALTER TABLE `chatmessages`
  ADD CONSTRAINT `chatmessages_ibfk_1` FOREIGN KEY (`ConversationID`) REFERENCES `conversations` (`ConversationID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chatmessages_ibfk_2` FOREIGN KEY (`SenderUserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chatmessages_ibfk_3` FOREIGN KEY (`ReceiverUserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`UserOneID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`UserTwoID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conversations_last_message` FOREIGN KEY (`LastMessageID`) REFERENCES `chatmessages` (`MessageID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `orders_buyer`
--
ALTER TABLE `orders_buyer`
  ADD CONSTRAINT `orders_buyer_ibfk_1` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_buyer_ibfk_2` FOREIGN KEY (`ShippingAddressID`) REFERENCES `addresses` (`AddressID`) ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `platformcategories`
--
ALTER TABLE `platformcategories`
  ADD CONSTRAINT `platformcategories_ibfk_1` FOREIGN KEY (`ParentCategoryID`) REFERENCES `platformcategories` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `productimages`
--
ALTER TABLE `productimages`
  ADD CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `productreviews`
--
ALTER TABLE `productreviews`
  ADD CONSTRAINT `productreviews_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productreviews_ibfk_2` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productreviews_ibfk_3` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `platformcategories` (`CategoryID`) ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `returnrequests`
--
ALTER TABLE `returnrequests`
  ADD CONSTRAINT `returnrequests_ibfk_1` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_2` FOREIGN KEY (`OrderItemID`) REFERENCES `orderitems` (`OrderItemID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_3` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `returnrequests_ibfk_4` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `shopfollows`
--
ALTER TABLE `shopfollows`
  ADD CONSTRAINT `shopfollows_ibfk_1` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopfollows_ibfk_2` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `shoporders`
--
ALTER TABLE `shoporders`
  ADD CONSTRAINT `shoporders_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `orders_buyer` (`OrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shoporders_ibfk_2` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `shopreviews`
--
ALTER TABLE `shopreviews`
  ADD CONSTRAINT `shopreviews_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopreviews_ibfk_2` FOREIGN KEY (`UserID_Buyer`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shopreviews_ibfk_3` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `shops`
--
ALTER TABLE `shops`
  ADD CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`UserID_Owner`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_role` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_users_default_address` FOREIGN KEY (`DefaultShippingAddressID`) REFERENCES `addresses` (`AddressID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  ADD CONSTRAINT `userusedvouchers_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userusedvouchers_ibfk_2` FOREIGN KEY (`VoucherID`) REFERENCES `vouchers` (`VoucherID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userusedvouchers_ibfk_3` FOREIGN KEY (`ShopOrderID`) REFERENCES `shoporders` (`ShopOrderID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD CONSTRAINT `vouchers_ibfk_1` FOREIGN KEY (`ShopID`) REFERENCES `shops` (`ShopID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
