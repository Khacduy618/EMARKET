<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderSeller extends Model
{
    use HasFactory;

    protected $table = 'ordersseller';
    protected $primaryKey = 'SellerOrderID';

    /**
     * Lấy thông tin shop sở hữu đơn hàng này.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID');
    }

    /**
     * Lấy thông tin đơn hàng tổng của người mua.
     */
    public function orderBuyer(): BelongsTo
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID');
    }

    /**
     * Lấy các sản phẩm (OrderItems) thuộc về đơn hàng tổng (OrderBuyer)
     * VÀ đồng thời thuộc về shop của đơn hàng con này (OrderSeller).
     * Đây là logic quan trọng để hiển thị đúng sản phẩm ở trang chi tiết.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID')
            ->whereHas('variant.product', function ($query) {
                // Lọc các order item chỉ thuộc về shop này
                $query->where('ShopID', $this->ShopID);
            });
    }
}