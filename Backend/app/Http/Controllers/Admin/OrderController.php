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
                'shop:ShopID,ShopName,ShopLevel,LogoURL',
                'orderBuyer.user:UserID,FullName,Email,Avatar',
                'orderBuyer.shippingAddress',
                'items.variant.product.primaryImage:ProductImageID,ProductID,ImageURL',
                'items.variant.attributes.attribute:AttributeID,Name',
                'items.variant.attributes.attributeValue:AttributeValueID,Value'
            ]);

            $orderBuyer = $sellerOrder->orderBuyer;
            $user = $orderBuyer->user;
            $address = $orderBuyer->shippingAddress;
            $shop = $sellerOrder->shop;

            $formattedItems = $sellerOrder->items->map(function ($item) {
                $variant = $item->variant;
                $product = $variant->product;
                $classification = $variant->attributes->map(fn ($attr) => $attr->attribute->Name . ': ' . $attr->attributeValue->Value)->implode(', ');
                $imageUrl = $variant->ImageURL ?? $product->primaryImage?->ImageURL;
                return [
                    'orderItemId' => $item->OrderItemID,
                    'quantity' => $item->Quantity,
                    'priceAtPurchase' => $item->PriceAtPurchase,
                    'subtotal' => $item->Subtotal,
                    'product' => [ 'productId' => $product->ProductID, 'name' => $product->Name, 'sku' => $variant->SKU, 'image' => $imageUrl, 'classification' => $classification, ],
                ];
            });

            $formattedData = [
                'sellerOrderId' => $sellerOrder->SellerOrderID, 'sellerOrderCode' => $sellerOrder->SellerOrderCode, 'status' => $sellerOrder->Status,
                'notes' => $sellerOrder->Notes, 'trackingCode' => $sellerOrder->TrackingCode, 'shippingCarrier' => $sellerOrder->ShippingCarrier, 'createdAt' => $sellerOrder->created_at,
                'orderDate' => $orderBuyer->OrderDate, 'paymentMethod' => $orderBuyer->PaymentMethod, 'paymentStatus' => $orderBuyer->PaymentStatus,
                'subtotalAmount' => $sellerOrder->SubtotalAmount, 'shippingFee' => $sellerOrder->ShippingFee, 'shopVoucherDiscount' => $sellerOrder->ShopVoucherDiscount, 'totalAmount' => $sellerOrder->TotalAmount,
                'user' => [ 'userId' => $user->UserID, 'fullName' => $user->FullName, 'email' => $user->Email, 'avatar' => $user->Avatar, ],
                'shippingAddress' => $address ? [ 'fullName' => $address->FullName, 'phoneNumber' => $address->PhoneNumber, 'fullAddress' => "{$address->Street}, {$address->Ward}, {$address->District}, {$address->City}", 'street' => $address->Street, 'ward' => $address->Ward, 'district' => $address->District, 'city' => $address->City, ] : null,
                'shop' => [ 'shopId' => $shop->ShopID, 'shopName' => $shop->ShopName, 'shopLevel' => $shop->ShopLevel, ],
                'items' => $formattedItems,
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