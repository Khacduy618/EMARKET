<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderSeller; // <<< THAY ĐỔI: Sử dụng model OrderSeller
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use App\Exports\OrdersExport;
use Maatwebsite\Excel\Facades\Excel;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng của các shop (Seller Orders) với bộ lọc và phân trang.
     * Kết quả được sắp xếp ưu tiên theo ShopID để dễ dàng nhóm ở frontend.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'sort_by' => ['sometimes', 'string', Rule::in(['OrderDate', 'TotalAmount'])],
                'sort_order' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
                'search' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', 'string'],
                'start_date' => ['nullable', 'date_format:Y-m-d'],
                'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
                'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
                'shop_id' => ['nullable', 'integer', 'exists:shops,ShopID'],
            ]);

            $sortBy = $request->input('sort_by', 'OrderDate');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10);

            $query = OrderSeller::with([
                'shop:ShopID,ShopName',
                'orderBuyer:OrderID,UserID,OrderDate',
                'orderBuyer.user:UserID,FullName,Email,Avatar'
            ]);

            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('SellerOrderCode', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('shop', fn($shopQuery) => $shopQuery->where('ShopName', 'LIKE', "%{$searchTerm}%"))
                      ->orWhereHas('orderBuyer.user', fn($userQuery) => $userQuery->where('FullName', 'LIKE', "%{$searchTerm}%"));
                });
            }
            if ($request->filled('status') && $request->input('status') !== 'all') {
                $query->whereIn('Status', explode(',', $request->status));
            }
            if ($request->filled('start_date')) {
                $query->whereHas('orderBuyer', fn($obQuery) => $obQuery->whereDate('OrderDate', '>=', $request->start_date));
            }
            if ($request->filled('end_date')) {
                $query->whereHas('orderBuyer', fn($obQuery) => $obQuery->whereDate('OrderDate', '<=', $request->end_date));
            }
            if ($request->filled('shop_id')) {
                $query->where('ShopID', $request->shop_id);
            }
            
            $query->orderBy('ordersseller.ShopID', 'asc');

            if ($sortBy === 'OrderDate') {
                $query->select('ordersseller.*')
                      ->join('ordersbuyer', 'ordersseller.OrderID', '=', 'ordersbuyer.OrderID')
                      ->orderBy('ordersbuyer.OrderDate', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            $orders = $query->paginate($perPage);
            return response()->json($orders);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi lấy danh sách đơn hàng.'], 500);
        }
    }

    /**
     * Lấy chi tiết một đơn hàng của shop (SellerOrder) và định dạng lại dữ liệu JSON.
     */
    public function show(OrderSeller $sellerOrder): JsonResponse
    {
        try {
            $sellerOrder->load([
            'shop:ShopID,ShopName,Level,LogoURL',
            'orderBuyer.user:UserID,FullName,Email,Avatar',
            'orderBuyer.shippingAddress',
            'orderItems.variant.product.primaryImage:ImageID,ProductID,ImageURL',
            
            // SỬA Ở ĐÂY:
            // 1. Tải các 'attributes' (là các AttributeValue) cho mỗi variant
            'orderItems.variant.attributes' => function ($query) {
                // Chọn các cột cần thiết cho AttributeValue
                $query->select('AttributeValues.AttributeValueID', 'AttributeValues.AttributeID', 'AttributeValues.Value');
            },

            // 2. Từ mỗi 'attribute' (AttributeValue) đã tải, tải tiếp quan hệ 'attribute' (là model Attribute)
            'orderItems.variant.attributes.attribute' => function ($query) {
                // Chọn các cột cần thiết cho Attribute
                $query->select('Attributes.AttributeID', 'Attributes.Name');
            }
        ]);

            $orderBuyer = $sellerOrder->orderBuyer;
            if (!$orderBuyer) {
            Log::warning('Không tìm thấy OrderBuyer cho SellerOrder ID: ' . $sellerOrder->SellerOrderID . '. Có thể do lỗi toàn vẹn dữ liệu.');
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin đơn hàng gốc tương ứng.'
            ], 404);
        }   
            $user = $orderBuyer->user;
            $address = $orderBuyer->shippingAddress;
            $shop = $sellerOrder->shop;
            $formattedItems = $sellerOrder->orderItems->map(function ($item) {
                $variant = $item->variant;
                if (!$variant || !$variant->product) {
                    return null;
                }
                $product = $variant->product;
                
                // Dùng quan hệ đã load
               $classification = $variant->attributes->map(function ($attributeValue) {
                    // '$attributeValue' bây giờ là một model AttributeValue
                    // Và nó đã được load sẵn quan hệ 'attribute'
                    if ($attributeValue && $attributeValue->attribute) { 
                        return $attributeValue->attribute->Name . ': ' . $attributeValue->Value;
                    }
                    return null;
                })->filter()->implode(', ');

                $imageUrl = $variant->ImageURL ?? $product->primaryImage?->ImageURL;
                
                return [
                    'OrderItemID' => $item->OrderItemID, // Giữ lại tên key từ model
                    'Quantity' => $item->Quantity,
                    'PriceAtPurchase' => $item->PriceAtPurchase,
                    'Subtotal' => $item->Subtotal,
                    'variant' => [
                        'SKU' => $variant->SKU,
                        'ImageURL' => $variant->ImageURL,
                        'product' => [
                            'Name' => $product->Name,
                            'primaryImage' => $product->primaryImage,
                        ],
                        // **SỬA Ở ĐÂY: Trả về cấu trúc đơn giản hơn**
                        'attributes' => $variant->attributes, // Trả về nguyên gốc, frontend sẽ tự xử lý
                        'classification_string' => $classification, // Trả về chuỗi đã format sẵn
                    ]
                ];
            })->filter()->values();

            $formattedData = [
                'sellerOrderId' => $sellerOrder->SellerOrderID, 'sellerOrderCode' => $sellerOrder->SellerOrderCode, 'status' => $sellerOrder->Status,
                'notes' => $sellerOrder->Notes, 'trackingCode' => $sellerOrder->TrackingCode, 'shippingCarrier' => $sellerOrder->ShippingCarrier, 'createdAt' => $sellerOrder->created_at,
                'orderDate' => $orderBuyer->OrderDate, 'paymentMethod' => $orderBuyer->PaymentMethod, 'paymentStatus' => $orderBuyer->PaymentStatus,
                'subtotalAmount' => $sellerOrder->SubtotalAmount, 'shippingFee' => $sellerOrder->ShippingFee, 'shopVoucherDiscount' => $sellerOrder->ShopVoucherDiscount, 'totalAmount' => $sellerOrder->TotalAmount,
                'user' => [ 'userId' => $user->UserID, 'fullName' => $user->FullName, 'email' => $user->Email, 'avatar' => $user->Avatar, ],
                'shippingAddress' => $address ? [ 'fullName' => $address->FullName, 'phoneNumber' => $address->PhoneNumber, 'fullAddress' => "{$address->Street}, {$address->Ward}, {$address->District}, {$address->City}", 'street' => $address->Street, 'ward' => $address->Ward, 'district' => $address->District, 'city' => $address->City, ] : null,
                'shop' => [ 'shopId' => $shop->ShopID, 'shopName' => $shop->ShopName, 'shopLevel' => $shop->Level, ],
                'orderItems' => $formattedItems,
            ];

            return response()->json(['success' => true, 'data' => $formattedData]);

        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết SellerOrder ID ' . $sellerOrder->SellerOrderID . ': ' . $e->getMessage());
            return response()->json([ 'success' => false, 'message' => 'Lỗi server khi lấy chi tiết đơn hàng.' ], 500);
        }
    }

    /**
     * Lấy thống kê nhanh về đơn hàng cho dashboard (dựa trên Seller Orders).
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'pending' => OrderSeller::where('Status', 'Pending')->count(),
                'processing' => OrderSeller::where('Status', 'Processing')->count(),
                'shipped' => OrderSeller::whereIn('Status', ['Shipped', 'OutForDelivery'])->count(),
                'total' => OrderSeller::count(),
            ];
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy thống kê đơn hàng: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể lấy thống kê.'], 500);
        }
    }

    /**
     * Lấy danh sách shop để làm bộ lọc.
     */
    public function getShopFilters(): JsonResponse
    {
        try {
            $shops = Shop::where('Status', 'Approved')->select('ShopID', 'ShopName')->orderBy('ShopName', 'asc')->get();
            return response()->json($shops);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách shop: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể tải danh sách shop.'], 500);
        }
    }
}