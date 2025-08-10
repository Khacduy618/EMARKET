<?php

// namespace App\Http\Controllers\Admin;

// use App\Http\Controllers\Controller;
// use App\Models\OrderBuyer;
// use Illuminate\Http\JsonResponse;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Validation\Rule;
// use Illuminate\Support\Facades\DB;

// class OrderController extends Controller
// {
//     /**
//      * Lấy danh sách đơn hàng với các bộ lọc nâng cao.
//      */
//     public function index(Request $request)
//     {   
//         // $user = $request->user();
//         // if (!$user || !$user->hasRole('Admin')) {
//         //     return response()->json(['message' => 'Unauthorized'], 403);
//         // }
//         try {
//             $sortableColumns = ['OrderDate', 'TotalAmount'];
//             $sortBy = $request->input('sortBy', 'OrderDate');
//             $sortOrder = $request->input('sortOrder', 'desc');

//             if (!in_array($sortBy, $sortableColumns)) {
//                 $sortBy = 'OrderDate';
//             }

//             $query = OrderBuyer::with(['user', 'items.product']);

//             // Tìm kiếm theo mã đơn hoặc tên người dùng
//             if ($request->filled('search')) {
//                 $searchTerm = $request->search;
//                 $query->where(function ($q) use ($searchTerm) {
//                     $q->where('OrderCode', 'LIKE', "%{$searchTerm}%")
//                       ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
//                           $userQuery->where('FullName', 'LIKE', "%{$searchTerm}%");
//                       });
//                 });
//             }

//             // Lọc theo trạng thái
//             if ($request->filled('status')) {
//                 $statuses = explode(',', $request->status);
//                 $query->whereIn('OverallStatus', $statuses);
//             }

//             // Lọc theo ngày bắt đầu
//             if ($request->filled('start_date')) {
//                 $query->whereDate('OrderDate', '>=', $request->start_date);
//             }

//             // Lọc theo ngày kết thúc
//             if ($request->filled('end_date')) {
//                 $query->whereDate('OrderDate', '<=', $request->end_date);
//             }

//             $orders = $query->orderBy($sortBy, $sortOrder)->paginate(15);

//             return response()->json($orders);
//         } catch (\Exception $e) {
//             Log::error('Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage());
//             return response()->json(['message' => 'Lỗi server khi lấy danh sách đơn hàng.'], 500);
//         }
//     }

//     /**
//      * Lấy chi tiết một đơn hàng.
//      */
//     public function show(string $id): JsonResponse
//     {
        
//         try {
//             // 1. Lấy thông tin chính của đơn hàng, user và địa chỉ
//             $order = DB::table('ordersbuyer as o')
//                 ->join('users as u', 'o.UserID', '=', 'u.UserID')
//                 ->leftJoin('addresses as a', 'o.ShippingAddressID', '=', 'a.AddressID') // Dùng leftJoin phòng trường hợp địa chỉ bị xóa
//                 ->select(
//                     'o.*', // Lấy tất cả cột từ bảng ordersbuyer
//                     // Dữ liệu người dùng
//                     'u.UserID as user_UserID', 'u.FullName as user_FullName', 'u.Email as user_Email', 'u.Avatar as user_Avatar',
//                     // Ghép các phần địa chỉ thành một chuỗi fullAddress
//                     DB::raw("CONCAT_WS(', ', a.Street, a.Ward, a.District, a.City) as shippingAddress_fullAddress")
//                 )
//                 ->where('o.OrderID', $id)
//                 ->first();

//             if (!$order) {
//                 return response()->json(['message' => 'Không tìm thấy đơn hàng.'], 404);
//             }

//             // 2. Lấy danh sách sản phẩm trong đơn hàng
//             $items = DB::table('orderitems as oi')
//                 ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
//                 ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
//                 // Lấy ảnh Primary của sản phẩm, nếu không có thì lấy ảnh của variant
//                 ->leftJoin('productimages as pimg', function($join) {
//                     $join->on('p.ProductID', '=', 'pimg.ProductID')
//                          ->where('pimg.IsPrimary', '=', 1);
//                 })
//                 ->select(
//                     'oi.OrderItemID', 'oi.VariantID', 'oi.Quantity', 'oi.PriceAtPurchase', 'oi.Subtotal',
//                     'p.Name as product_name',
//                     'pv.SKU as product_sku',
//                     // Sử dụng COALESCE để ưu tiên ảnh primary, nếu null thì lấy ảnh của variant
//                     DB::raw('COALESCE(pimg.ImageURL, pv.ImageURL) as product_image')
//                 )
//                 ->where('oi.OrderID', $id)
//                 ->get();

//             // 3. Ghép dữ liệu lại theo cấu trúc mà Frontend mong muốn
//             $formattedOrder = [
//                 // Các trường của đơn hàng
//                 'OrderID' => $order->OrderID,
//                 'OrderCode' => $order->OrderCode,
//                 'UserID' => $order->UserID,
//                 'OrderDate' => $order->OrderDate,
//                 'TotalAmount' => $order->TotalAmount,
//                 'SubtotalAmount' => $order->SubtotalAmount,
//                 'ShippingFee' => $order->ShippingFee,
//                 'DiscountAmount' => $order->DiscountAmount,
//                 'ShippingAddressID' => $order->ShippingAddressID,
//                 'ShippingFullName' => $order->ShippingFullName,
//                 'ShippingPhoneNumber' => $order->ShippingPhoneNumber,
//                 'Notes' => $order->Notes,
//                 'PaymentMethod' => $order->PaymentMethod,
//                 'PaymentStatus' => $order->PaymentStatus,
//                 'OverallStatus' => $order->OverallStatus,
//                 // Dữ liệu user lồng vào
//                 'user' => [
//                     'UserID' => $order->user_UserID,
//                     'FullName' => $order->user_FullName,
//                     'Email' => $order->user_Email,
//                     'avatar' => $order->user_Avatar,
//                 ],
//                 // Dữ liệu địa chỉ lồng vào
//                 'shippingAddress' => [
//                     'fullAddress' => $order->shippingAddress_fullAddress,
//                 ],
//                 // Dữ liệu sản phẩm lồng vào
//                 'items' => $items->map(function ($item) {
//                     return [
//                         'OrderItemID' => $item->OrderItemID,
//                         'VariantID' => $item->VariantID,
//                         'Quantity' => $item->Quantity,
//                         'PriceAtPurchase' => $item->PriceAtPurchase,
//                         'Subtotal' => $item->Subtotal,
//                         'product' => [
//                             'name' => $item->product_name,
//                             'sku' => $item->product_sku,
//                             'image' => $item->product_image,
//                         ],
//                     ];
//                 })
//             ];

//             return response()->json(['data' => $formattedOrder]);

//         } catch (\Exception $e) {
//             Log::error('Lỗi khi lấy chi tiết đơn hàng ID ' . $id . ': ' . $e->getMessage());
//             return response()->json(['message' => 'Lỗi server khi lấy chi tiết đơn hàng.'], 500);
//         }
//     }

//     /**
//      * Cập nhật trạng thái đơn hàng.
//      */
//     public function updateStatus(Request $request, OrderBuyer $orderBuyer): JsonResponse
//     {
//         $validated = $request->validate([
//             'status' => ['required', 'string', Rule::in(['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Failed'])]
//         ]);

//         try {
//             $orderBuyer->OverallStatus = $validated['status'];
//             $orderBuyer->save();

//             return response()->json([
//                 'message' => 'Cập nhật trạng thái đơn hàng thành công.',
//                 'order' => $orderBuyer
//             ]);
//         } catch (\Exception $e) {
//             Log::error('Lỗi khi cập nhật trạng thái cho OrderID ' . $orderBuyer->OrderID . ': ' . $e->getMessage());
//             return response()->json(['message' => 'Cập nhật trạng thái thất bại.'], 500);
//         }
//     }
    
// }

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
            ]);

            $sortBy = $request->input('sort_by', 'OrderDate');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10); // Lấy số lượng mục mỗi trang từ request

            $query = OrderBuyer::with(['user']); // Chỉ cần tải thông tin user cho trang danh sách

            // Tìm kiếm theo mã đơn hoặc tên người dùng
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('OrderCode', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                          $userQuery->where('FullName', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }

            // Lọc theo trạng thái, bỏ qua nếu giá trị là 'all'
            if ($request->filled('status') && $request->input('status') !== 'all') {
                $statuses = explode(',', $request->status);
                $query->whereIn('OverallStatus', $statuses);
            }

            // Lọc theo khoảng ngày
            if ($request->filled('start_date')) {
                $query->whereDate('OrderDate', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('OrderDate', '<=', $request->end_date);
            }

            // Thực hiện sắp xếp và phân trang
            $orders = $query->orderBy($sortBy, $sortOrder)->paginate($perPage);

            return response()->json($orders);

        } catch (ValidationException $e) {
            // Trả về lỗi validation nếu dữ liệu không hợp lệ
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Ghi log và trả về lỗi server
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
     * Cập nhật trạng thái đơn hàng.
     *
     * @param Request $request
     * @param OrderBuyer $orderBuyer
     * @return JsonResponse
     */
    public function updateStatus(Request $request, OrderBuyer $orderBuyer): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Failed'])]
        ]);

        try {
            $orderBuyer->OverallStatus = $validated['status'];
            $orderBuyer->save();

            return response()->json([
                'message' => 'Cập nhật trạng thái đơn hàng thành công.',
                'order' => $orderBuyer
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái cho OrderID ' . $orderBuyer->OrderID . ': ' . $e->getMessage());
            return response()->json(['message' => 'Cập nhật trạng thái thất bại.'], 500);
        }
    }
}
