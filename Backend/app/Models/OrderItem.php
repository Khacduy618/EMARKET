<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\OrdersSeller;
use App\Models\ProductVariant;

class OrderItem extends Model {

    protected $table = 'orderitems';

    /**
     * Khai báo khóa chính để Eloquent không nhầm lẫn.
     */
    protected $primaryKey = 'OrderItemID';
    public $timestamps = false;

    protected $fillable = [
        'SellerOrderID',
        'VariantID',
        'Quantity',
        'PriceAtPurchase',
        'Subtotal',
        'IsFlashSaleItem',
        'FlashSaleDealID',
        'ReturnStatus'
    ];

    protected $casts = [
        'IsFlashSaleItem' => 'boolean',
        'Quantity' => 'integer',
        'PriceAtPurchase' => 'float',
        'Subtotal' => 'float',
    ];

    /**
     * Fix lỗi cast decimal bằng accessor
     */
    public function getPriceAtPurchaseAttribute($value)
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }
    public function sellerOrder()
    {
        return $this->belongsTo(SellerOrder::class, 'SellerOrderID', 'SellerOrderID');
    }
    public function getSubtotalAttribute($value)
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }

    /**
     * Liên kết với đơn hàng.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(OrdersSeller::class, 'SellerOrderID', 'SellerOrderID');
    }

    /**
     * Liên kết với biến thể sản phẩm.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }

    /**
     * Lấy thông tin sản phẩm qua biến thể.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }
}