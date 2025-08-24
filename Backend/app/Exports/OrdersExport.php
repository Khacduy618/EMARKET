<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class OrdersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Câu truy vấn này đã đúng, không cần thay đổi
        $query = DB::table('orderitems as oi')
            ->join('ordersseller as os', 'oi.SellerOrderID', '=', 'os.SellerOrderID')
            ->join('ordersbuyer as ob', 'os.OrderID', '=', 'ob.OrderID')
            ->join('users as u', 'ob.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            ->select(
                'os.SellerOrderCode',
                'u.FullName as CustomerName',
                'ob.OrderDate',
                's.ShopName',
                'p.Name as ProductName',
                'pv.SKU',
                'oi.Quantity',
                'oi.PriceAtPurchase',
                'oi.Subtotal',
                'os.TotalAmount as OrderTotal',
                'os.Status as OrderStatus',
                'ob.PaymentMethod',
                'os.PaymentStatus'
            );

        // Các bộ lọc từ request (đã đúng)
        if (!empty($this->filters['search'])) {
            $searchTerm = $this->filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('os.SellerOrderCode', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('u.FullName', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('p.Name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('s.ShopName', 'LIKE', "%{$searchTerm}%");
            });
        }
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->whereIn('os.Status', explode(',', $this->filters['status']));
        }
        if (!empty($this->filters['shop_id'])) {
            $query->where('s.ShopID', $this->filters['shop_id']);
        }
        if (!empty($this->filters['start_date'])) {
            $query->whereDate('ob.OrderDate', '>=', $this->filters['start_date']);
        }
        if (!empty($this->filters['end_date'])) {
            $query->whereDate('ob.OrderDate', '<=', $this->filters['end_date']);
        }
        if (!empty($this->filters['payment_method'])) {
            $query->where('ob.PaymentMethod', $this->filters['payment_method']);
        }
        if (!empty($this->filters['payment_status'])) {
            $query->where('os.PaymentStatus', $this->filters['payment_status']);
        }

        // Sắp xếp (đã đúng)
        $sortBy = $this->filters['sort_by'] ?? 'OrderDate';
        $sortOrder = $this->filters['sort_order'] ?? 'desc';
        
        if ($sortBy === 'OrderDate') {
            $query->orderBy('ob.OrderDate', $sortOrder);
        } else {
             $query->orderBy('os.TotalAmount', $sortOrder);
        }

        return $query->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        // ▼▼▼ SỬA LỖI: Sắp xếp lại tiêu đề cho đúng thứ tự và số lượng cột ▼▼▼
        return [
            'STT',
            'Mã Đơn Hàng',
            'Khách Hàng',
            'Ngày Đặt',
            'Tên Shop',
            'Tên Sản Phẩm',
            'SKU',
            'Số Lượng',
            'Đơn Giá (SP)',
            'Thành Tiền (SP)',
            'Tổng Tiền (ĐH)',
            'Trạng Thái ĐH', 
            'PT Thanh Toán', 
            'TT Thanh Toán'
        ];
    }

    /**
     * @param mixed $row
     *
     * @return array
     */
    public function map($row): array
    {
        static $index = 0;
        $index++;
        
        // ▼▼▼ SỬA LỖI: Sắp xếp lại dữ liệu cho khớp với tiêu đề ▼▼▼
        return [
            $index,
            $row->SellerOrderCode,
            $row->CustomerName,
            Carbon::parse($row->OrderDate)->format('d/m/Y H:i:s'),
            $row->ShopName,
            $row->ProductName,
            $row->SKU,
            $row->Quantity,
            number_format($row->PriceAtPurchase),
            number_format($row->Subtotal),
            number_format($row->OrderTotal),
            $row->OrderStatus,
            $row->PaymentMethod, // Cột PT Thanh Toán
            $row->PaymentStatus  // Cột TT Thanh Toán
        ];
    }

    /**
     * Áp dụng style cho sheet.
     *
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        $cellRange = 'A1:' . $sheet->getHighestColumn() . $sheet->getHighestRow();
        $sheet->getStyle($cellRange)->getFont()->setName('Times New Roman')->setSize(13);
        $sheet->getStyle('A1:' . $sheet->getHighestColumn() . '1')->getFont()->setBold(true);
    }
}