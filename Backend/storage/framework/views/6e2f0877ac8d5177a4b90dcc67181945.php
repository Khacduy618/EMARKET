<!DOCTYPE html>
<html>

<head>
    <title>Phiếu Giao Hàng - Đơn <?php echo e($order->OrderID); ?></title>
    <style>
    body {
        font-family: "DejaVu Sans", sans-serif;
        margin: 20px;
    }



    h1 {
        text-align: center;
        border-bottom: 1px solid #000;
        padding-bottom: 10px;
    }

    .info {
        margin: 10px 0;
    }
    </style>
</head>

<body>
    <h1>Phiếu Giao Hàng</h1>
    <div class="info">
        <p><strong>Ma don hang:</strong> <?php echo e($order->OrderCode); ?></p>
        <p><strong>Ngay dat hang:</strong> <?php echo e($order->OrderDate); ?></p>
        <p><strong>Trang thai:</strong> <?php echo e($order->OverallStatus); ?></p>
        <p><strong>Khach hang:</strong> <?php echo e($order->ShippingFullName); ?></p>
        <p><strong>So dien thoai:</strong> <?php echo e($order->ShippingPhoneNumber); ?></p>
        <p><strong>Đia chi:</strong>
            <?php echo e($order->address ? $order->address->Street . ', ' . $order->address->Ward . ', ' . $order->address->District . ', ' . $order->address->City : 'Chưa có thông tin'); ?>

        </p>
        <p><strong>Tổng tiền:</strong> <?php echo e(number_format($order->TotalAmount, 0, ',', '.')); ?> VND</p>
    </div>
</body>

</html><?php /**PATH C:\Users\Admin\EMARKET\Backend\resources\views/pdf/shipping_label.blade.php ENDPATH**/ ?>