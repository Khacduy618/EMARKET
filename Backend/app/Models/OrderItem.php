<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\OrderBuyer;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;

class OrderItem extends Model {

    protected $table = 'orderitems';

    /**
     * Khai báo khóa chính để Eloquent không nhầm lẫn.
     */
    protected $primaryKey = 'OrderItemID';
    public $timestamps = false;

    protected $fillable = [
        'OrderID',
        'VariantID',
        'Quantity',
        'PriceAtPurchase',
        'Subtotal',
        'IsFlashSaleItem',
        'FlashSaleDealID',
        'ReturnStatus'
    ];

    public function order()
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }
    /**
     * Get the flash sale deal associated with the order item.
     */
    public function flashSaleDeal(): BelongsTo
    {
        return $this->belongsTo(FlashSale::class, 'FlashSaleDealID', 'DealID');
    }

    /**
     * Get the return request for the order item.
     */
    public function returnRequest(): HasOne
    {
        return $this->hasOne(ReturnRequest::class, 'OrderItemID', 'OrderItemID');
    }

    // Removed shopOrder relationship as it's not in the schema
}
