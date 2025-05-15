-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2025 at 09:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
  `AddressID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Street` varchar(255) NOT NULL,
  `Ward` varchar(100) DEFAULT NULL,
  `District` varchar(100) NOT NULL,
  `City` varchar(100) NOT NULL,
  `IsDefault` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `BannerID` int(11) NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `ImageURL` varchar(512) NOT NULL,
  `LinkURL` varchar(512) DEFAULT NULL,
  `Position` varchar(100) DEFAULT NULL,
  `SortOrder` int(11) DEFAULT 0,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cartitems`
--

CREATE TABLE `cartitems` (
  `CartItemID` int(11) NOT NULL,
  `CartID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `ShopID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `AddedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `CartID` int(11) NOT NULL,
  `UserID_Buyer` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chatmessages`
--

CREATE TABLE `chatmessages` (
  `MessageID` int(11) NOT NULL,
  `ConversationID` int(11) NOT NULL,
  `SenderUserID` int(11) NOT NULL,
  `ReceiverUserID` int(11) NOT NULL,
  `MessageContent` text NOT NULL,
  `MessageType` enum('Text','Image','ProductLink') DEFAULT 'Text',
  `IsRead` tinyint(1) DEFAULT 0,
  `ReadAt` timestamp NULL DEFAULT NULL,
  `SentAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `ConversationID` int(11) NOT NULL,
  `UserOneID` int(11) NOT NULL,
  `UserTwoID` int(11) NOT NULL,
  `LastMessageID` int(11) DEFAULT NULL,
  `LastMessageAt` timestamp NULL DEFAULT NULL,
  `UserOneUnreadCount` int(11) DEFAULT 0,
  `UserTwoUnreadCount` int(11) DEFAULT 0,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `OrderItemID` int(11) NOT NULL,
  `ShopOrderID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `PriceAtPurchase` decimal(12,2) NOT NULL,
  `Subtotal` decimal(14,2) NOT NULL,
  `ReturnStatus` enum('None','Requested','Approved','Rejected','Returned','Refunded') DEFAULT 'None',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders_buyer`
--

CREATE TABLE `orders_buyer` (
  `OrderID` int(11) NOT NULL,
  `OrderCode` varchar(20) NOT NULL,
  `UserID_Buyer` int(11) NOT NULL,
  `OrderDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `TotalAmount` decimal(14,2) NOT NULL,
  `ShippingAddressID` int(11) NOT NULL,
  `ShippingFullName` varchar(255) NOT NULL,
  `ShippingPhoneNumber` varchar(20) NOT NULL,
  `ShippingStreet` varchar(255) NOT NULL,
  `ShippingWard` varchar(100) DEFAULT NULL,
  `ShippingDistrict` varchar(100) NOT NULL,
  `ShippingCity` varchar(100) NOT NULL,
  `Notes` text DEFAULT NULL,
  `PaymentMethod` enum('COD','BankTransfer','OnlineGateway') NOT NULL,
  `PaymentStatus` enum('Pending','Paid','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  `OverallStatus` enum('Pending','Processing','Shipped','Delivered','Cancelled','Returned','ReturnInProgress') NOT NULL DEFAULT 'Pending',
  `PlatformVoucherCode` varchar(50) DEFAULT NULL,
  `PlatformDiscountAmount` decimal(12,2) DEFAULT 0.00,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platformcategories`
--

CREATE TABLE `platformcategories` (
  `CategoryID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `ParentCategoryID` int(11) DEFAULT NULL,
  `Slug` varchar(255) NOT NULL,
  `ImageURL` varchar(512) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productimages`
--

CREATE TABLE `productimages` (
  `ImageID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `ImageURL` varchar(512) NOT NULL,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT 0,
  `SortOrder` int(11) DEFAULT 0,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productreviews`
--

CREATE TABLE `productreviews` (
  `ReviewID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `UserID_Buyer` int(11) NOT NULL,
  `ShopOrderID` int(11) DEFAULT NULL,
  `Rating` tinyint(4) NOT NULL CHECK (`Rating` >= 1 and `Rating` <= 5),
  `Comment` text DEFAULT NULL,
  `ReviewImages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ReviewImages`)),
  `IsApproved` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductID` int(11) NOT NULL,
  `ShopID` int(11) NOT NULL,
  `CategoryID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `SKU` varchar(100) DEFAULT NULL,
  `Price` decimal(12,2) NOT NULL,
  `StockQuantity` int(11) NOT NULL DEFAULT 0,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `AdminApprovalStatus` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `ReasonForRejection` text DEFAULT NULL,
  `AverageRating` float DEFAULT 0,
  `ViewCount` int(11) DEFAULT 0,
  `SoldCount` int(11) DEFAULT 0,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `returnrequests`
--

CREATE TABLE `returnrequests` (
  `ReturnRequestID` int(11) NOT NULL,
  `ShopOrderID` int(11) NOT NULL,
  `OrderItemID` int(11) DEFAULT NULL,
  `UserID_Buyer` int(11) NOT NULL,
  `ShopID` int(11) NOT NULL,
  `RequestType` enum('Return','Refund','ReturnAndRefund') NOT NULL,
  `ReasonCode` varchar(50) DEFAULT NULL,
  `ReasonDescription` text NOT NULL,
  `EvidenceURLs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`EvidenceURLs`)),
  `Status` enum('PendingSellerApproval','SellerApproved_WaitForReturn','SellerReceivedProduct','RefundProcessing','Refunded','SellerRejected','BuyerCancelled','AdminIntervention','Closed') NOT NULL DEFAULT 'PendingSellerApproval',
  `SellerNote` text DEFAULT NULL,
  `AdminNote` text DEFAULT NULL,
  `ResolutionType` enum('FullRefund','PartialRefund','ProductExchange','NoAction','StoreCredit') DEFAULT NULL,
  `RefundAmount` decimal(12,2) DEFAULT NULL,
  `BuyerShippingInfoForReturn` text DEFAULT NULL,
  `ShopShippingInfoForReturn` text DEFAULT NULL,
  `RequestedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `LastUpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shopfollows`
--

CREATE TABLE `shopfollows` (
  `FollowID` int(11) NOT NULL,
  `UserID_Buyer` int(11) NOT NULL,
  `ShopID` int(11) NOT NULL,
  `FollowedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shoporders`
--

CREATE TABLE `shoporders` (
  `ShopOrderID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `ShopID` int(11) NOT NULL,
  `ShopOrderCode` varchar(25) NOT NULL,
  `SubtotalForShop` decimal(12,2) NOT NULL,
  `ShippingFeeForShop` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ShopVoucherCode` varchar(50) DEFAULT NULL,
  `ShopDiscountAmount` decimal(12,2) DEFAULT 0.00,
  `TotalAmountForShop` decimal(12,2) NOT NULL,
  `ShopOrderStatus` enum('PendingConfirmation','Processing','ReadyToShip','Shipped','Delivered','CancelledBySeller','CancelledByBuyer','Returned','ReturnRequested','ReturnApproved','ReturnRejected') NOT NULL DEFAULT 'PendingConfirmation',
  `EstimatedDeliveryDate` date DEFAULT NULL,
  `TrackingNumber` varchar(100) DEFAULT NULL,
  `ShippingProvider` varchar(100) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shopreviews`
--

CREATE TABLE `shopreviews` (
  `ReviewID` int(11) NOT NULL,
  `ShopID` int(11) NOT NULL,
  `UserID_Buyer` int(11) NOT NULL,
  `ShopOrderID` int(11) DEFAULT NULL,
  `Rating` tinyint(4) NOT NULL CHECK (`Rating` >= 1 and `Rating` <= 5),
  `Comment` text DEFAULT NULL,
  `IsApproved` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `ShopID` int(11) NOT NULL,
  `UserID_Owner` int(11) NOT NULL,
  `ShopName` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `LogoURL` varchar(512) DEFAULT NULL,
  `CoverImageURL` varchar(512) DEFAULT NULL,
  `ShopAddress` text DEFAULT NULL,
  `ShopPhone` varchar(20) DEFAULT NULL,
  `AverageRating` float DEFAULT 0,
  `Status` enum('PendingApproval','Approved','Suspended','Rejected') NOT NULL DEFAULT 'PendingApproval',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sitesettings`
--

CREATE TABLE `sitesettings` (
  `SettingKey` varchar(100) NOT NULL,
  `SettingValue` text DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `DefaultShippingAddressID` int(11) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Level` enum('Đồng','Bạc','Vàng','Bạch kim','Kim cương') NOT NULL DEFAULT 'Đồng',
  `Role` enum('Buyer','Seller','Admin') NOT NULL DEFAULT 'Buyer',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userusedvouchers`
--

CREATE TABLE `userusedvouchers` (
  `UserUsedVoucherID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `VoucherID` int(11) NOT NULL,
  `ShopOrderID` int(11) NOT NULL,
  `TimesUsedThisOrder` int(11) NOT NULL DEFAULT 1,
  `UsedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

CREATE TABLE `vouchers` (
  `VoucherID` int(11) NOT NULL,
  `Code` varchar(50) NOT NULL,
  `Description` text DEFAULT NULL,
  `DiscountType` enum('Percentage','FixedAmount') NOT NULL,
  `DiscountValue` decimal(10,2) NOT NULL,
  `MaxValueForPercentage` decimal(10,2) DEFAULT NULL,
  `MinOrderValue` decimal(12,2) DEFAULT 0.00,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL,
  `UsageLimitPerUser` int(11) DEFAULT NULL,
  `UsageLimitTotal` int(11) DEFAULT NULL,
  `TimesUsed` int(11) NOT NULL DEFAULT 0,
  `Scope` enum('Platform','Shop') NOT NULL,
  `ShopID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  MODIFY `AddressID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `BannerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cartitems`
--
ALTER TABLE `cartitems`
  MODIFY `CartItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `CartID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chatmessages`
--
ALTER TABLE `chatmessages`
  MODIFY `MessageID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `ConversationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `OrderItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders_buyer`
--
ALTER TABLE `orders_buyer`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `platformcategories`
--
ALTER TABLE `platformcategories`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productimages`
--
ALTER TABLE `productimages`
  MODIFY `ImageID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productreviews`
--
ALTER TABLE `productreviews`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `returnrequests`
--
ALTER TABLE `returnrequests`
  MODIFY `ReturnRequestID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopfollows`
--
ALTER TABLE `shopfollows`
  MODIFY `FollowID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shoporders`
--
ALTER TABLE `shoporders`
  MODIFY `ShopOrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopreviews`
--
ALTER TABLE `shopreviews`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `ShopID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userusedvouchers`
--
ALTER TABLE `userusedvouchers`
  MODIFY `UserUsedVoucherID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `VoucherID` int(11) NOT NULL AUTO_INCREMENT;

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
