<!DOCTYPE html>
<html>

<head>
    <title>Phiếu Giao Hàng - Đơn <?php echo e($order->OrderID); ?></title>
    <style>
    body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 11pt;
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: 180mm;
        /* vừa với A4 */
        margin: 0 auto;
        border: 1px solid #000;
        padding: 8mm;
        box-sizing: border-box;
    }

    h2 {
        text-align: center;
        margin-bottom: 12px;
    }

    .info {
        margin-bottom: 10px;
    }

    .info p {
        margin: 2px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        table-layout: fixed;
        /* chia đều cột */
        word-wrap: break-word;
        word-break: break-word;
    }

    th,
    td {
        border: 1px solid #000;
        padding: 6px;
        font-size: 11pt;
    }

    th {
        background-color: #f2f2f2;
        font-weight: bold;
        text-align: center;
    }

    td:nth-child(2) {
        text-align: left;
        white-space: normal;
        /* cho phép xuống dòng */
    }

    .totals {
        margin-top: 15px;
        text-align: right;
    }

    .totals p {
        margin: 3px 0;
    }
    </style>
</head>

<body>
    <div class="container">
        <h1>Phiếu Giao Hàng</h1>

        <!-- Shop Information -->

        <!-- Order Information -->
        <div class="section">
            <div class="section-title">Thông tin đơn hàng</div>
            <div class="info-grid">
                <p><strong>Mã đơn hàng:</strong> <?php echo e($order->SellerOrderCode); ?></p>
                <p><strong>Ngày đặt hàng:</strong> <?php echo e(\Carbon\Carbon::parse($order->OrderDate)->format('d/m/Y H:i')); ?>

                </p>
                <p><strong>Thanh toán:</strong> <?php echo e(number_format($order->TotalAmount, 0, ',', '.')); ?> VND</p>
            </div>
        </div>

        <!-- Customer and Shipping Information -->
        <div class="section">
            <div class="section-title">Thông tin khách hàng</div>
            <div class="info-grid">
                <p><strong>Họ tên:</strong> <?php echo e($orderBuyer->ShippingFullName); ?></p>
                <p><strong>SĐT:</strong> <?php echo e($orderBuyer->ShippingPhoneNumber); ?></p>
                <p><strong>Địa chỉ:</strong>
                    <?php echo e($order->address ? $order->address->Street . ', ' . ($order->address->Ward ? $order->address->Ward . ', ' : '') . $order->address->District . ', ' . $order->address->City : 'Chưa có thông tin'); ?>

                </p>
                <p><strong>Email:</strong> <?php echo e($order->user->Email ?? 'Không có'); ?></p>
            </div>
        </div>

        <!-- Order Items -->
        <div class="section">
            <div class="section-title">Chi tiết sản phẩm</div>
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>SKU</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__currentLoopData = $order->orderItems; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e($index + 1); ?></td>
                        <td style="text-align:left"><?php echo e($item->variant->product->Name ?? 'Không xác định'); ?></td>
                        <td><?php echo e($item->variant->SKU ?? 'N/A'); ?></td>
                        <td><?php echo e($item->Quantity); ?></td>
                        <td><?php echo e(number_format($item->PriceAtPurchase, 0, ',', '.')); ?> VND</td>
                        <td><?php echo e(number_format($item->Subtotal, 0, ',', '.')); ?> VND</td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>

            <!-- Totals -->
            <table class="totals">
                <tr>
                    <td>Tạm tính:</td>
                    <td><?php echo e(number_format($order->SubtotalAmount ?? $order->TotalAmount, 0, ',', '.')); ?> VND</td>
                </tr>
                <?php if(!empty($order->ShopVoucherDiscount) && $order->ShopVoucherDiscount > 0): ?>
                <tr>
                    <td>Giảm giá (Voucher):</td>
                    <td>-<?php echo e(number_format($order->ShopVoucherDiscount, 0, ',', '.')); ?> VND</td>
                </tr>
                <?php endif; ?>
                <tr>
                    <td>Tổng cộng:</td>
                    <td><strong><?php echo e(number_format($order->TotalAmount, 0, ',', '.')); ?> VND</strong></td>
                </tr>
            </table>
        </div>
    </div>
</body>

</html><?php /**PATH /var/www/html/resources/views/pdf/shipping_label.blade.php ENDPATH**/ ?>