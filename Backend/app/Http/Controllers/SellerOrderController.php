<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id() ;  // Giả sử sử dụng middleware auth để lấy UserID
        $shop = Shop::where('UserID', $userId )->first();

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $orders = OrderBuyer::whereIn('OrderID', function ($query) use ($shop) {
            $query->select('OrderID')
                ->from('orderitems')
                ->whereIn('VariantID', function ($subQuery) use ($shop) {
                    $subQuery->select('VariantID')
                        ->from('productvariants')
                        ->whereIn('ProductID', function ($subSubQuery) use ($shop) {
                            $subSubQuery->select('ProductID')
                                ->from('products')
                                ->where('ShopID', $shop->ShopID);
                        });
                });
        })
        ->with(['orderItems.variant.product', 'address'])
        ->get();
        
        return response()->json(['orders' =>  $orders ], 200);  
    }
    public function show($id)
    {
        $userId = Auth::id();
        $shop = Shop::where('UserID', $userId)->first();

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        // Fetch the specific order, ensuring it belongs to the shop
        $order = OrderBuyer::where('OrderID', $id)
            ->whereIn('OrderID', function ($query) use ($shop) {
                $query->select('OrderID')
                    ->from('orderitems')
                    ->whereIn('VariantID', function ($subQuery) use ($shop) {
                        $subQuery->select('VariantID')
                            ->from('productvariants')
                            ->whereIn('ProductID', function ($subSubQuery) use ($shop) {
                                $subSubQuery->select('ProductID')
                                    ->from('products')
                                    ->where('ShopID', $shop->ShopID);
                            });
                    });
            })
            ->with([
                'orderItems.variant.product' => function ($query) {
                    $query->select('ProductID', 'ProductName', 'ShopID');
                },
                'address' => function ($query) {
                    $query->select('AddressID', 'Street', 'City', 'Country', 'PostalCode');
                }
            ])
            ->select('OrderID', 'OrderStatus', 'TotalPrice', 'CreatedAt')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found or not associated with your shop'], 404);
        }
        return response()->json(['order' => $order], 200);
    }
}