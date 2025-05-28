<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Để ghi log nếu cần

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $position = $request->query('position', 'hero'); // Mặc định lấy vị trí 'hero'

            $banners = Banner::query()
                ->where('Position', $position) // Lọc theo vị trí
                ->currentlyActive() // Sử dụng scope đã định nghĩa ở Model
                ->orderBy('SortOrder', 'asc') // Sắp xếp theo SortOrder
                ->get();

            // Xử lý ImageURL nếu nó là đường dẫn tương đối và bạn muốn trả về URL đầy đủ từ server Laravel
            // (Cách này hữu ích nếu Next.js và Laravel server chung domain hoặc bạn muốn tập trung logic URL ở backend)
            $processedBanners = $banners->map(function ($banner) {
                if ($banner->ImageURL && !(str_starts_with($banner->ImageURL, 'http://') || str_starts_with($banner->ImageURL, 'https://'))) {
                    // Giả sử ảnh được lưu trong public/images/banners/
                    // và ImageURL trong DB là 'banners/my_image.jpg'
                    $banner->ImageURL = asset($banner->ImageURL);
                    // Hoặc nếu ImageURL trong DB là '/images/banners/my_image.jpg', asset() vẫn hoạt động tốt.
                }
                return $banner;
            });


            // Trả về dữ liệu theo cấu trúc mà Next.js mong đợi (ví dụ: { data: [...] })
            return response()->json(['data' => $processedBanners]);

        } catch (\Exception $e) {
            // Ghi log lỗi để debug
            Log::error('Error fetching banners: ' . $e->getMessage());
            // Trả về lỗi cho client
            return response()->json(['message' => 'Không thể tải danh sách banner.', 'error' => $e->getMessage()], 500);
        }
    }
}