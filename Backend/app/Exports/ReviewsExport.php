<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithAutoSize;

class ReviewsExport implements FromQuery, WithHeadings, WithMapping, WithAutoSize
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = DB::table('productreviews as pr')
            ->join('users as u', 'pr.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            ->select(
                'pr.ReviewID', 'u.FullName', 'pr.Rating', 'pr.Comment',
                'pr.CreatedAt', 'pr.Status', 'p.Name as ProductName', 's.ShopName'
            );

        // Áp dụng các bộ lọc tương tự hàm index
        if (!empty($this->filters['query'])) {
            $searchTerm = '%' . $this->filters['query'] . '%';
            $query->where(fn($q) => $q->where('s.ShopName', 'LIKE', $searchTerm)
                ->orWhere('p.Name', 'LIKE', $searchTerm)->orWhere('u.FullName', 'LIKE', $searchTerm)
                ->orWhere('pr.Comment', 'LIKE', $searchTerm));
        }
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('pr.Status', $this->filters['status']);
        }
        if (!empty($this->filters['minRating'])) {
            $query->where('pr.Rating', '>=', $this->filters['minRating']);
        }
        if (!empty($this->filters['onlyRequests']) && $this->filters['onlyRequests'] == 'true') {
            $query->where('pr.ShopRequestStatus', '=', 'Open');
        }

        return $query->orderBy('pr.CreatedAt', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID', 'Tên Shop', 'Tên Sản Phẩm', 'Người Đánh Giá',
            'Rating', 'Nội Dung', 'Trạng Thái', 'Ngày Tạo',
        ];
    }

    public function map($review): array
    {
        return [
            $review->ReviewID,
            $review->ShopName,
            $review->ProductName,
            $review->FullName,
            $review->Rating,
            $review->Comment,
            $review->Status,
            \Carbon\Carbon::parse($review->CreatedAt)->format('d/m/Y H:i'),
        ];
    }
}