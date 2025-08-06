<?php

namespace App\Exports;

use App\Models\ProductReview;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ReviewsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $reviews;

    public function __construct($reviews)
    {
        $this->reviews = $reviews;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->reviews;
    }

    /**
     * Định nghĩa các tiêu đề cho cột trong file Excel.
     *
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID Review',
            'Người đánh giá',
            'Email',
            'Tên sản phẩm',
            'ID Sản phẩm',
            'Đánh giá (Sao)',
            'Nội dung',
            'Phản hồi của shop',
            'Trạng thái',
            'Ngày tạo',
        ];
    }

    /**
     * Ánh xạ dữ liệu từ mỗi review vào các cột tương ứng.
     * Hàm này giúp chúng ta xử lý dữ liệu một cách an toàn.
     *
     * @param mixed $review
     * @return array
     */
    public function map($review): array
    {
        // Xác định trạng thái một cách an toàn
        $status = 'Chờ duyệt';
        if ($review->IsApproved === true) {
            $status = 'Đã duyệt';
        } elseif ($review->IsApproved === false) {
            $status = 'Từ chối';
        } elseif ($review->Rating == 5) {
            $status = 'Tự động duyệt';
        }

        return [
            $review->ReviewID,
            // SỬ DỤNG NULL-SAFE OPERATOR (?->) ĐỂ TRÁNH LỖI KHI USER/PRODUCT BỊ XÓA
            $review->user?->FullName ?? 'Người dùng đã bị xóa',
            $review->user?->Email ?? 'N/A',
            $review->product?->Name ?? 'Sản phẩm đã bị xóa',
            $review->product?->ProductID ?? 'N/A',
            $review->Rating,
            $review->Comment,
            $review->AdminReply ?? '', // Trả về chuỗi rỗng nếu chưa có phản hồi
            $status,
            // Định dạng lại ngày tháng cho dễ đọc
            \Carbon\Carbon::parse($review->CreatedAt)->format('d-m-Y H:i:s'),
        ];
    }
}