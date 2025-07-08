<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\OrderBuyer;
use App\Models\OrderItem;
use App\Models\Shop;

class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        // Get the authenticated seller's user ID
        $user = Auth::user();
        if ($user->Role !== 'Người bán') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $userID = $user->UserID ; 
        $shop = Shop::where('UserID', $userID )->first();
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $orders = OrderBuyer::with(['orderItems.productVariant.product', 'user'])
    ->where('ShopID', $shop->ShopID)
    ->get()
            ->map(function ($order) {
                return [
                    'OrderID' => $order->OrderID,
                    'OrderCode' => $order->OrderCode,
                    'User' => [
                        'UserID' => $order->user->UserID,
                        'Username' => $order->user->Username,
                        'FullName' => $order->user->FullName,
                    ],
                    'OrderDate' => $order->OrderDate,
                    'TotalAmount' => $order->TotalAmount,
                    'OverallStatus' => $order->OverallStatus,
                    'PaymentStatus' => $order->PaymentStatus,
                    'ShippingAddress' => [
                        'FullName' => $order->ShippingFullName,
                        'PhoneNumber' => $order->ShippingPhoneNumber,
                    ],
                    'Items' => $order->orderItems->map(function ($item) {
                        return [
                            'ProductName' => $item->productVariant->product->Name,
                            'Quantity' => $item->Quantity,
                            'PriceAtPurchase' => $item->PriceAtPurchase,
                            'Subtotal' => $item->Subtotal,
                        ];
                    }),
                ];
            });

        return response()->json(['orders' => $orders], 200);
    }
    public function show($orderId)
    {
        $user = Auth::user();
        if ($user->Role !== 'Người bán') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $shop = Shop::where('UserID', $user->UserID )->first();
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $order = OrderBuyer::with(['orderItems.productVariant.product', 'user'])
         ->where('OrderID', $orderId)
         ->where('ShopID', $shop->ShopID)
         ->first();


        if (!$order) {
            return response()->json(['error' => 'Order not found or not related to your shop'], 404);
        }

        $orderDetails = [
            'OrderID' => $order->OrderID,
            'OrderCode' => $order->OrderCode,
            'User' => [
                'UserID' => $order->user->UserID,
                'Username' => $order->user->Username,
                'FullName' => $order->user->FullName,
            ],
            'OrderDate' => $order->OrderDate,
            'TotalAmount' => $order->TotalAmount,
            'SubtotalAmount' => $order->SubtotalAmount,
            'ShippingFee' => $order->ShippingFee,
            'DiscountAmount' => $order->DiscountAmount,
            'OverallStatus' => $order->OverallStatus,
            'PaymentStatus' => $order->PaymentStatus,
            'PaymentMethod' => $order->PaymentMethod,
            'ShippingAddress' => [
                'FullName' => $order->ShippingFullName,
                'PhoneNumber' => $order->ShippingPhoneNumber,
                'Street' => $order->address->Street ?? '',
                'Ward' => $order->address->Ward ?? '',
                'District' => $order->address->District ?? '',
                'City' => $order->address->City ?? '',
            ],
            'Notes' => $order->Notes,
            'Items' => $order->orderItems->map(function ($item) {
                return [
                    'ProductName' => $item->productVariant->product->Name,
                    'VariantDetails' => $item->productVariant->SKU ?? 'N/A',
                    'Quantity' => $item->Quantity,
                    'PriceAtPurchase' => $item->PriceAtPurchase,
                    'Subtotal' => $item->Subtotal,
                    'ReturnStatus' => $item->ReturnStatus,
                ];
            }),
        ];

        return response()->json(['order' => $orderDetails], 200);
    }
}