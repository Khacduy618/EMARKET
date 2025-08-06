<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng với các bộ lọc nâng cao.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $sortableColumns = ['OrderDate', 'TotalAmount'];
            $sortBy = $request->input('sortBy', 'OrderDate');
            $sortOrder = $request->input('sortOrder', 'desc');

            if (!in_array($sortBy, $sortableColumns)) {
                $sortBy = 'OrderDate';
            }

            $query = OrderBuyer::with(['user', 'items.product']);

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

            // Lọc theo trạng thái
            if ($request->filled('status')) {
                $statuses = explode(',', $request->status);
                $query->whereIn('OverallStatus', $statuses);
            }

            // Lọc theo ngày bắt đầu
            if ($request->filled('start_date')) {
                $query->whereDate('OrderDate', '>=', $request->start_date);
            }

            // Lọc theo ngày kết thúc
            if ($request->filled('end_date')) {
                $query->whereDate('OrderDate', '<=', $request->end_date);
            }

            $orders = $query->orderBy($sortBy, $sortOrder)->paginate(15);

            return response()->json($orders);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi lấy danh sách đơn hàng.'], 500);
        }
    }

    /**
     * Lấy chi tiết một đơn hàng.
     */
    public function show(OrderBuyer $orderBuyer): JsonResponse
    {
        try {
            $orderBuyer->load(['user', 'items.product']);
            return response()->json(['data' => $orderBuyer]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết đơn hàng ID ' . $orderBuyer->OrderID . ': ' . $e->getMessage());
            return response()->json(['message' => 'Không thể tìm thấy đơn hàng.'], 404);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng.
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
