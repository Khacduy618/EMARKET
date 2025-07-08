<?php

namespace App\Http\Controllers\Seller;

use App\Models\Order;
use App\Models\OrderItem;
use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->first();

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $query = Order::whereHas('items', function ($q) use ($shop) {
            $q->whereHas('variant', function ($q2) use ($shop) {
                $q2->whereHas('product', function ($q3) use ($shop) {
                    $q3->where('ShopID', $shop->ShopID);
                });
            });
        })->with(['items.variant.product', 'user', 'shippingAddress']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('OverallStatus', $request->status);
        }

        // Search by OrderCode
        if ($request->has('search')) {
            $query->where('OrderCode', 'like', '%' . $request->search . '%');
        }

        $orders = $query->orderBy('OrderDate', 'desc')->paginate(10);

        return response()->json($orders);
    }

    public function show($id)
    {
        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->first();

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $order = Order::where('OrderID', $id)
            ->whereHas('items', function ($q) use ($shop) {
                $q->whereHas('variant', function ($q2) use ($shop) {
                    $q2->whereHas('product', function ($q3) use ($shop) {
                        $q3->where('ShopID', $shop->ShopID);
                    });
                });
            })
            ->with(['items.variant.product', 'user', 'shippingAddress'])
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Processing,Shipped,Delivered,CancelledBySeller'
        ]);

        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->first();

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $order = Order::where('OrderID', $id)
            ->whereHas('items', function ($q) use ($shop) {
                $q->whereHas('variant', function ($q2) use ($shop) {
                    $q2->whereHas('product', function ($q3) use ($shop) {
                        $q3->where('ShopID', $shop->ShopID);
                    });
                });
            })
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->OverallStatus = $request->status;
        $order->save();

        return response()->json(['message' => 'Order status updated', 'order' => $order]);
    }
}