<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class OrdersExport implements FromQuery, WithHeadings, WithMapping, WithEvents, WithColumnFormatting
{
    protected $filters;
    private $rowNumber = 0;
    private $orderGroupCache = [];

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = DB::table('orderitems as oi')
            ->join('ordersbuyer as o', 'oi.OrderID', '=', 'o.OrderID')
            ->join('users as u', 'o.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            ->select(
                'o.OrderID', 'o.OrderCode', 'u.FullName', 'o.OrderDate',
                'p.Name as ProductName', 'pv.SKU', 'oi.Quantity',
                'oi.PriceAtPurchase', 'oi.Subtotal', 'o.TotalAmount', 'o.OverallStatus',
                's.ShopName'
            );

        if (!empty($this->filters['search'])) {
            $searchTerm = $this->filters['search'];
            $query->where(fn($q) => $q->where('o.OrderCode', 'LIKE', "%{$searchTerm}%")->orWhere('u.FullName', 'LIKE', "%{$searchTerm}%"));
        }
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->whereIn('o.OverallStatus', explode(',', $this->filters['status']));
        }
        if (!empty($this->filters['start_date'])) {
            $query->whereDate('o.OrderDate', '>=', $this->filters['start_date']);
        }
        if (!empty($this->filters['end_date'])) {
            $query->whereDate('o.OrderDate', '<=', $this->filters['end_date']);
        }
        if (!empty($this->filters['shop_id'])) {
            $query->where('p.ShopID', $this->filters['shop_id']);
        }

        $sortBy = $this->filters['sort_by'] ?? 'OrderDate';
        $sortOrder = $this->filters['sort_order'] ?? 'desc';
        $query->orderBy('o.' . $sortBy, $sortOrder)->orderBy('o.OrderID', 'desc');

        return $query;
    }

    public function headings(): array
    {
        return [
            'STT', 'Mã Đơn Hàng', 'Khách Hàng', 'Ngày Đặt', 'Tên Shop', 'Tên Sản Phẩm', 'SKU',
            'Số Lượng', 'Đơn Giá (SP)', 'Thành Tiền (SP)', 'Tổng Tiền (ĐH)', 'Trạng Thái ĐH',
        ];
    }

    public function map($item): array
    {
        $this->rowNumber++;
        $this->orderGroupCache[$this->rowNumber + 1] = $item->OrderID;

        return [
            $this->rowNumber,
            $item->OrderCode,
            $item->FullName,
            Date::PHPToExcel($item->OrderDate),
            $item->ShopName,
            $item->ProductName,
            $item->SKU,
            $item->Quantity,
            $item->PriceAtPurchase,
            $item->Subtotal,
            $item->TotalAmount,
            $item->OverallStatus,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'D' => 'dd/mm/yyyy hh:mm',
            'I' => '#,##0',
            'J' => '#,##0',
            'K' => '#,##0',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $sheet->getStyle('A1:L1')->getFont()->setBold(true);
                $sheet->getStyle('A1:L1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if (empty($this->orderGroupCache)) return;

                $startRow = 2;
                $totalRows = count($this->orderGroupCache) + 1;

                for ($i = 2; $i <= $totalRows; $i++) {
                    if ($i === $totalRows || $this->orderGroupCache[$i] !== $this->orderGroupCache[$i + 1]) {
                        if ($startRow < $i) {
                            $sheet->mergeCells("B{$startRow}:B{$i}");
                            $sheet->mergeCells("C{$startRow}:C{$i}");
                            $sheet->mergeCells("D{$startRow}:D{$i}");
                            $sheet->mergeCells("K{$startRow}:K{$i}");
                            $sheet->mergeCells("L{$startRow}:L{$i}");
                        }
                        $startRow = $i + 1;
                    }
                }

                $sheet->getStyle('B2:D' . $totalRows)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle('K2:L' . $totalRows)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

                foreach (range('A', 'L') as $columnID) {
                    $sheet->getColumnDimension($columnID)->setAutoSize(true);
                }
            },
        ];
    }
}