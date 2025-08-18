<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
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
     * Lấy danh sách đơn hàng với các bộ lọc nâng cao.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Bạn có thể bỏ comment phần này nếu đã cài đặt hệ thống xác thực và vai trò (role)
        /*
        $user = $request->user();
        if (!$user || !$user->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        */
        try {
            // Validate đầu vào một cách chặt chẽ
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
            // ▲▲▲ KẾT THÚC SỬA LỖI ▲▲▲

            $sortBy = $request->input('sort_by', 'OrderDate');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10);

            $query = OrderBuyer::with(['user', 'items.variant.product.shop:ShopID,ShopName']);

            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('OrderCode', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', fn($userQuery) => $userQuery->where('FullName', 'LIKE', "%{$searchTerm}%"));
                });
            }
            if ($request->filled('status') && $request->input('status') !== 'all') {
                $query->whereIn('OverallStatus', explode(',', $request->status));
            }
            if ($request->filled('start_date')) {
                $query->whereDate('OrderDate', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('OrderDate', '<=', $request->end_date);
            }
            if ($request->filled('shop_id')) {
                $shopId = $request->shop_id;
                $query->whereHas('items.variant.product', fn($productQuery) => $productQuery->where('ShopID', $shopId));
            }

            $orders = $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
            return response()->json($orders);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi lấy danh sách đơn hàng.'], 500);
        }
    }

     /**
     * Lấy chi tiết một đơn hàng.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            // 1. Lấy thông tin chính của đơn hàng, user và địa chỉ
            $order = DB::table('ordersbuyer as o')
                ->join('users as u', 'o.UserID', '=', 'u.UserID')
                ->leftJoin('addresses as a', 'o.ShippingAddressID', '=', 'a.AddressID')
                ->select(
                    'o.*',
                    'u.UserID as user_UserID', 'u.FullName as user_FullName', 'u.Email as user_Email', 'u.Avatar as user_Avatar',
                    DB::raw("CONCAT_WS(', ', a.Street, a.Ward, a.District, a.City) as shippingAddress_fullAddress")
                )
                ->where('o.OrderID', $id)
                ->first();

            if (!$order) {
                return response()->json(['message' => 'Không tìm thấy đơn hàng.'], 404);
            }

            // 2. Lấy danh sách sản phẩm trong đơn hàng
            $items = DB::table('orderitems as oi')
                ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->leftJoin('productimages as pimg', function($join) {
                    $join->on('p.ProductID', '=', 'pimg.ProductID')
                         ->where('pimg.IsPrimary', '=', 1);
                })
                ->select(
                    'oi.OrderItemID', 'oi.VariantID', 'oi.Quantity', 'oi.PriceAtPurchase', 'oi.Subtotal',
                    'p.Name as product_name',
                    'pv.SKU as product_sku',
                    DB::raw('COALESCE(pimg.ImageURL, pv.ImageURL) as product_image')
                )
                ->where('oi.OrderID', $id)
                ->get();

            // 3. Ghép dữ liệu lại theo cấu trúc mà Frontend mong muốn
            $formattedOrder = [
                'OrderID' => $order->OrderID,
                'OrderCode' => $order->OrderCode,
                'UserID' => $order->UserID,
                'OrderDate' => $order->OrderDate,
                'TotalAmount' => $order->TotalAmount,
                'SubtotalAmount' => $order->SubtotalAmount,
                'ShippingFee' => $order->ShippingFee,
                'DiscountAmount' => $order->DiscountAmount,
                'ShippingAddressID' => $order->ShippingAddressID,
                'ShippingFullName' => $order->ShippingFullName,
                'ShippingPhoneNumber' => $order->ShippingPhoneNumber,
                'Notes' => $order->Notes,
                'PaymentMethod' => $order->PaymentMethod,
                'PaymentStatus' => $order->PaymentStatus,
                'OverallStatus' => $order->OverallStatus,
                'user' => [
                    'UserID' => $order->user_UserID,
                    'FullName' => $order->user_FullName,
                    'Email' => $order->user_Email,
                    'avatar' => $order->user_Avatar,
                ],
                'shippingAddress' => [
                    'fullAddress' => $order->shippingAddress_fullAddress,
                ],
                'items' => $items->map(function ($item) {
                    return [
                        'OrderItemID' => $item->OrderItemID,
                        'VariantID' => $item->VariantID,
                        'Quantity' => $item->Quantity,
                        'PriceAtPurchase' => $item->PriceAtPurchase,
                        'Subtotal' => $item->Subtotal,
                        'product' => [
                            'name' => $item->product_name,
                            'sku' => $item->product_sku,
                            'image' => $item->product_image,
                        ],
                    ];
                })
            ];

            return response()->json(['data' => $formattedOrder]);

        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết đơn hàng ID ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi lấy chi tiết đơn hàng.'], 500);
        }
    }


    /**
     * Cập nhật trạng thái tổng thể của đơn hàng (ví dụ: Admin hủy đơn).
     */
    public function updateOverallStatus(Request $request, OrderBuyer $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['CancelledBySeller', 'Processing', 'Shipped', 'Delivered', 'Completed'])]
        ]);

        try {
            $order->OverallStatus = $validated['status'];

            if ($validated['status'] === 'Processing' && $order->PaymentMethod === 'COD') {
                $order->PaymentStatus = 'Paid';
            }
            $order->save();

            return response()->json([
                'message' => 'Cập nhật trạng thái đơn hàng thành công.',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái cho OrderID ' . $order->OrderID . ': ' . $e->getMessage());
            return response()->json(['message' => 'Cập nhật trạng thái thất bại.'], 500);
        }
    }

    /**
     * Xuất danh sách đơn hàng ra file Excel.
     */
    public function export(Request $request)
    {
        $filters = $request->only([
            'search', 'status', 'start_date', 'end_date', 'sort_by', 'sort_order', 'shop_id'
        ]);
        $fileName = 'danh-sach-don-hang-' . now()->format('Ymd-His') . '.xlsx';
        return Excel::download(new OrdersExport($filters), $fileName);
    }

    /**
     * Lấy danh sách shop để làm bộ lọc.
     */
    public function getShopFilters(): JsonResponse
    {
        try {
            $shops = Shop::where('Status', 'Approved')
                         ->select('ShopID', 'ShopName')
                         ->orderBy('ShopName', 'asc')
                         ->get();
            return response()->json($shops);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách shop: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể tải danh sách shop.'], 500);
        }
    }

    /**
     * Lấy thống kê nhanh về đơn hàng cho dashboard.
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'pending' => OrderBuyer::where('OverallStatus', 'Pending')->count(),
                'processing' => OrderBuyer::where('OverallStatus', 'Processing')->count(),
                'shipped' => OrderBuyer::where('OverallStatus', 'Shipped')->count(),
                'total' => OrderBuyer::count(),
            ];
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy thống kê đơn hàng: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể lấy thống kê.'], 500);
        }
    }
}