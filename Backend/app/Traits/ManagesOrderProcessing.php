<?php
// In app/Traits/ManagesOrderProcessing.php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait ManagesOrderProcessing
{
    /**
     * Xử lý một đơn hàng đã được xác nhận: trừ kho, cộng sold count, và xóa giỏ hàng.
     * Hàm này nên được gọi BÊN TRONG một DB::transaction.
     *
     * @param object $order - Đối tượng đơn hàng từ bảng ordersbuyer
     */
    protected function processConfirmedOrder($order)
    {
        // 1. Lấy tất cả các gói hàng con (seller orders)
        $sellerOrderIds = DB::table('ordersseller')->where('OrderID', $order->OrderID)->pluck('SellerOrderID');
        if ($sellerOrderIds->isEmpty()) {
            Log::warning("OrderID {$order->OrderID} has no seller orders to process.", ['order' => $order]);
            return;
        }

        // 2. Lấy tất cả các chi tiết đơn hàng (order items)
        $orderItems = DB::table('orderitems')->whereIn('SellerOrderID', $sellerOrderIds)->get();
        if ($orderItems->isEmpty()) {
            Log::warning("OrderID {$order->OrderID} has no items to process.", ['order' => $order]);
            return;
        }

        // 3. Trừ kho số lượng biến thể
        foreach ($orderItems as $item) {
            DB::table('productvariants')
                ->where('VariantID', $item->VariantID)
                ->decrement('StockQuantity', $item->Quantity);
        }
        Log::info("[OrderProcessing] Decremented stock for OrderID: {$order->OrderID}");

        // 4. Cộng SoldCount cho sản phẩm
        $productSoldCount = [];
        $productIdsToUpdate = DB::table('productvariants')
            ->whereIn('VariantID', $orderItems->pluck('VariantID'))
            ->distinct()
            ->pluck('ProductID', 'VariantID');

        foreach ($orderItems as $item) {
            $productId = $productIdsToUpdate->get($item->VariantID);
            if ($productId) {
                if (!isset($productSoldCount[$productId])) {
                    $productSoldCount[$productId] = 0;
                }
                $productSoldCount[$productId] += $item->Quantity;
            }
        }
        foreach ($productSoldCount as $productId => $quantitySold) {
            DB::table('products')->where('ProductID', $productId)->increment('SoldCount', $quantitySold);
        }
        Log::info("[OrderProcessing] Incremented SoldCount for products in OrderID: {$order->OrderID}", $productSoldCount);

        // 5. Xóa khỏi giỏ hàng
        $cart = DB::table('carts')->where('UserID', $order->UserID)->first();
        if ($cart) {
            $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
            DB::table('cartitems')
                ->where('CartID', $cart->CartID)
                ->whereIn('VariantID', $variantIdsToRemove)
                ->delete();
            Log::info("[OrderProcessing] Cleared cart items for UserID: {$order->UserID}");
        }
    }
}