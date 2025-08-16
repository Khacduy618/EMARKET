<!DOCTYPE html>
<html>

<head>
    <title>Phiếu Giao Hàng - Đơn {{ $order->OrderID }}</title>
    <style>
    body {
        font-family: "DejaVu Sans", sans-serif;
        margin: 20mm;
        font-size: 12pt;
        line-height: 1.4;
    }

    .container {
        max-width: 190mm;
        /* A4 width minus margins */
        margin: 0 auto;
        border: 1px solid #000;
        padding: 10mm;
        box-sizing: border-box;
    }

    h1 {
        text-align: center;
        font-size: 16pt;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
        margin-bottom: 15px;
    }

    .section {
        margin-bottom: 15px;
    }

    .section-title {
        font-weight: bold;
        font-size: 13pt;
        margin-bottom: 8px;
        text-decoration: underline;
    }

    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .info-grid p {
        margin: 5px 0;
    }

    .info-grid p strong {
        display: inline-block;
        width: 120px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }

    th,
    td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }

    .total {
        font-weight: bold;
        text-align: right;
        margin-top: 10px;
    }

    .shop-info {
        margin-bottom: 15px;
        text-align: center;
        font-size: 11pt;
        color: #333;
    }
    </style>
</head>

<body>
    <div class="container">
        <h1>Phiếu Giao Hàng</h1>

        <!-- Shop Information -->
        <div class="shop-info">
            <p><strong>Cửa hàng:</strong> {{ $order->user->shop->Name ?? 'Cửa hàng không xác định' }}</p>
        </div>

        <!-- Order Information -->
        <div class="section">
            <div class="section-title">Thông tin đơn hàng</div>
            <div class="info-grid">
                <p><strong>Mã đơn hàng:</strong> {{ $order->OrderCode }}</p>
                <p><strong>Ngày đặt hàng:</strong> {{ \Carbon\Carbon::parse($order->OrderDate)->format('d/m/Y H:i') }}
                </p>
                <p><strong>Trạng thái:</strong> {{ $order->OverallStatus }}</p>
                <p><strong>Tổng tiền:</strong> {{ number_format($order->TotalAmount, 0, ',', '.') }} VND</p>
            </div>
        </div>

        <!-- Customer and Shipping Information -->
        <div class="section">
            <div class="section-title">Thông tin khách hàng</div>
            <div class="info-grid">
                <p><strong>Họ tên:</strong> {{ $order->ShippingFullName }}</p>
                <p><strong>Số điện thoại:</strong> {{ $order->ShippingPhoneNumber }}</p>
                <p><strong>Địa chỉ:</strong>
                    {{ $order->address ? $order->address->Street . ', ' . ($order->address->Ward ? $order->address->Ward . ', ' : '') . $order->address->District . ', ' . $order->address->City : 'Chưa có thông tin' }}
                </p>
                <p><strong>Email:</strong> {{ $order->user->Email ?? 'Không có' }}</p>
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
                    @foreach ($order->orderItems as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item->variant->product->Name ?? 'Không xác định' }}</td>
                        <td>{{ $item->variant->SKU ?? 'N/A' }}</td>
                        <td>{{ $item->Quantity }}</td>
                        <td>{{ number_format($item->PriceAtPurchase, 0, ',', '.') }} VND</td>
                        <td>{{ number_format($item->Subtotal, 0, ',', '.') }} VND</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="total">
                <p>Tổng cộng: {{ number_format($order->TotalAmount, 0, ',', '.') }} VND</p>
            </div>
        </div>
    </div>
</body>

</html>