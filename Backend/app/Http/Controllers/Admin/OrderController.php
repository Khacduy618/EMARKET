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
                'payment_method' => ['nullable', 'string', Rule::in(['COD', 'Paypal', 'VNPay'])],
                'payment_status' => ['nullable', 'string', Rule::in(['Pending', 'Paid', 'Failed', 'Refunded', 'PartiallyRefunded'])],
            ]);

            $sortBy = $request->input('sort_by', 'OrderDate');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10);

            $query = OrderSeller::with([
                'shop:ShopID,ShopName',
                'orderBuyer:OrderID,UserID,OrderDate,PaymentMethod,PaymentStatus',
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
            if ($request->filled('payment_method')) {
                $query->whereHas('orderBuyer', function ($q) use ($request) {
                    $q->where('PaymentMethod', $request->input('payment_method'));
                });
            }
            if ($request->filled('payment_status')) {
                $query->whereHas('orderBuyer', function ($q) use ($request) {
                    $q->where('PaymentStatus', $request->input('payment_status'));
                });
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
     public function show($sellerOrderId): JsonResponse
    {
        try {
            // === TRUY VẤN 1: Lấy thông tin chính của đơn hàng ===
            $order = DB::table('ordersseller as os')
                ->join('ordersbuyer as ob', 'os.OrderID', '=', 'ob.OrderID')
                ->join('users as u', 'ob.UserID', '=', 'u.UserID')
                ->join('addresses as a', 'ob.ShippingAddressID', '=', 'a.AddressID')
                ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
                ->where('os.SellerOrderID', $sellerOrderId)
                ->select(
                    // Thông tin chính của đơn hàng shop
                    'os.SellerOrderID as sellerOrderId',
                    'os.SellerOrderCode as sellerOrderCode',
                    'os.Status as status',
                    'os.Notes as notes',
                    'os.SubtotalAmount as subtotalAmount',
                    'os.ShippingFee as shippingFee',
                    'os.ShopVoucherDiscount as shopVoucherDiscount',
                    'os.TotalAmount as totalAmount',
                    // Thông tin từ đơn hàng tổng
                    'ob.OrderDate as orderDate',
                    'ob.PaymentMethod as paymentMethod',
                    'ob.PaymentStatus as paymentStatus',
                    // Thông tin người mua
                    'u.UserID as userId',
                    'u.FullName as userFullName',
                    'u.Email as userEmail',
                    'u.Avatar as userAvatar',
                    // Thông tin địa chỉ
                    'a.FullName as shippingFullName',
                    'a.PhoneNumber as shippingPhoneNumber',
                    'a.Street as shippingStreet',
                    'a.Ward as shippingWard',
                    'a.District as shippingDistrict',
                    'a.City as shippingCity',
                    // Thông tin shop
                    's.ShopID as shopId',
                    's.ShopName as shopName',
                    's.Level as shopLevel'
                )
                ->first();

            if (!$order) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
            }

            // === TRUY VẤN 2: Lấy danh sách sản phẩm trong đơn hàng ===
            $items = DB::table('orderitems as oi')
                ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->leftJoin('productimages as pi', function ($join) {
                    $join->on('p.ProductID', '=', 'pi.ProductID')
                         ->where('pi.IsPrimary', '=', 1);
                })
                ->where('oi.SellerOrderID', $sellerOrderId)
                ->select(
                    'oi.OrderItemID as orderItemId',
                    'oi.Quantity as quantity',
                    'oi.PriceAtPurchase as priceAtPurchase',
                    'oi.Subtotal as subtotal',
                    'pv.VariantID as variantId',
                    'pv.SKU as sku',
                    'pv.ImageURL as variantImage',
                    'p.Name as productName',
                    'pi.ImageURL as productImage'
                )->get();

            // Nếu không có sản phẩm nào, vẫn trả về thông tin đơn hàng
            if ($items->isEmpty()) {
                $order->items = []; // Gán mảng rỗng
            } else {
                 // === TRUY VẤN 3: Lấy tất cả thuộc tính của các sản phẩm trên trong 1 lần ===
                $variantIds = $items->pluck('variantId');
                $attributes = DB::table('productvariantattribute as pva')
                    ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
                    ->join('attributes as a', 'av.AttributeID', '=', 'a.AttributeID')
                    ->whereIn('pva.VariantID', $variantIds)
                    ->select('pva.VariantID as variantId', 'a.Name as attributeName', 'av.Value as attributeValue')
                    ->get()
                    ->groupBy('variantId'); // Nhóm các thuộc tính theo variantId

                // Gắn thuộc tính vào từng item
                $formattedItems = $items->map(function ($item) use ($attributes) {
                    $itemAttributes = $attributes->get($item->variantId, collect());
                    $item->classification = $itemAttributes->map(fn ($attr) => "{$attr->attributeName}: {$attr->attributeValue}")->implode(', ');
                    return $item;
                });
                $order->items = $formattedItems;
            }

            // === TỔNG HỢP DỮ LIỆU ĐỂ TRẢ VỀ ===
            $responseData = [
                'sellerOrderId' => $order->sellerOrderId,
                'sellerOrderCode' => $order->sellerOrderCode,
                'status' => $order->status,
                'notes' => $order->notes,
                'subtotalAmount' => $order->subtotalAmount,
                'shippingFee' => $order->shippingFee,
                'shopVoucherDiscount' => $order->shopVoucherDiscount,
                'totalAmount' => $order->totalAmount,
                'orderDate' => $order->orderDate,
                'paymentMethod' => $order->paymentMethod,
                'paymentStatus' => $order->paymentStatus,
                'user' => [
                    'userId' => $order->userId,
                    'fullName' => $order->userFullName,
                    'email' => $order->userEmail,
                    'avatar' => $order->userAvatar,
                ],
                'shippingAddress' => [
                    'fullName' => $order->shippingFullName,
                    'phoneNumber' => $order->shippingPhoneNumber,
                    'fullAddress' => "{$order->shippingStreet}, {$order->shippingWard}, {$order->shippingDistrict}, {$order->shippingCity}",
                ],
                'shop' => [
                    'shopId' => $order->shopId,
                    'shopName' => $order->shopName,
                    'shopLevel' => $order->shopLevel,
                ],
                'items' => $order->items->map(function ($item) {
                    return [
                        'orderItemId' => $item->orderItemId,
                        'quantity' => $item->quantity,
                        'priceAtPurchase' => $item->priceAtPurchase,
                        'subtotal' => $item->subtotal,
                        'productName' => $item->productName,
                        'productImage' => $item->variantImage ?? $item->productImage, // Ưu tiên ảnh variant
                        'sku' => $item->sku,
                        'classification' => $item->classification,
                    ];
                })
            ];

            return response()->json(['success' => true, 'data' => $responseData]);

        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết SellerOrder ID ' . $sellerOrderId . ': ' . $e->getMessage() . ' tại dòng ' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Lỗi server khi lấy chi tiết đơn hàng.'], 500);
        }
    }
    /**
     * Lấy thống kê nhanh về đơn hàng cho dashboard (dựa trên Seller Orders).
     */
    public function getStats(): JsonResponse
    {
         $totalRevenue = OrderSeller::whereIn('Status', ['Completed', 'Rated', 'Delivered'])
                                       ->sum('TotalAmount');

        try {
            $stats = [
                'pending' => OrderSeller::where('Status', 'Pending')->count(),
                'processing' => OrderSeller::where('Status', 'Processing')->count(),
                'shipped' => OrderSeller::whereIn('Status', ['Shipped', 'OutForDelivery'])->count(),
                'total' => OrderSeller::count(),
                'total_revenue' => $totalRevenue,
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
    public function export(Request $request)
    {
        // Lấy các bộ lọc từ request để truyền vào lớp Export
        $filters = $request->only([
            'search', 'status', 'start_date', 'end_date', 'sort_by', 'sort_order', 'shop_id', 'payment_method', 'payment_status'
        ]);

        $fileName = 'danh-sach-don-hang-' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new OrdersExport($filters), $fileName);
    }
}