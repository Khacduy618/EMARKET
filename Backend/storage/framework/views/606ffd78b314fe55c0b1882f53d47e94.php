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
        <p><strong>Mã đơn hàng:</strong> <?php echo e($order->OrderCode); ?></p>
        <p><strong>Ngày đặt hàng:</strong> <?php echo e($order->OrderDate); ?></p>
        <p><strong>Trạng thái:</strong> <?php echo e($order->OverallStatus); ?></p>
        <p><strong>Khách hàng</strong> <?php echo e($order->ShippingFullName); ?></p>
        <p><strong>Số điện thoại:</strong> <?php echo e($order->ShippingPhoneNumber); ?></p>
        <p><strong>Đia chỉ:</strong>
            <?php echo e($order->address ? $order->address->Street . ', ' . $order->address->Ward . ', ' . $order->address->District . ', ' . $order->address->City : 'Chưa có thông tin'); ?>

        </p>
        <p><strong>Tổng tiền:</strong> <?php echo e(number_format($order->TotalAmount, 0, ',', '.')); ?> VND</p>
    </div>
</body>

</html><?php /**PATH C:\Users\Admin\Desktop\FOLDER_linhtinh\pro_3\EMARKET\Backend\resources\views/pdf/shipping_label.blade.php ENDPATH**/ ?>