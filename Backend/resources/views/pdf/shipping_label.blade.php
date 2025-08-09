<!DOCTYPE html>
<html>

<head>
    <title>Phiếu Giao Hàng - Đơn {{ $order->OrderID }}</title>
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
        <p><strong>Mã đơn hàng:</strong> {{ $order->OrderCode }}</p>
        <p><strong>Ngày đặt hàng:</strong> {{ $order->OrderDate }}</p>
        <p><strong>Trạng thái:</strong> {{ $order->OverallStatus }}</p>
        <p><strong>Khách hàng</strong> {{ $order->ShippingFullName }}</p>
        <p><strong>Số điện thoại:</strong> {{ $order->ShippingPhoneNumber }}</p>
        <p><strong>Đia chỉ:</strong>
            {{ $order->address ? $order->address->Street . ', ' . $order->address->Ward . ', ' . $order->address->District . ', ' . $order->address->City : 'Chưa có thông tin' }}
        </p>
        <p><strong>Tổng tiền:</strong> {{ number_format($order->TotalAmount, 0, ',', '.') }} VND</p>
    </div>
</body>

</html>