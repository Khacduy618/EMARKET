<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\OrderBuyer;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;

class OrderItem extends Model
{
    use HasFactory;

    protected $primaryKey = 'OrderItemID';

    protected $fillable = [
        'OrderID', // Changed from ShopOrderID
        'VariantID', // Changed from ProductID
        'Quantity',
        'PriceAtPurchase',
        'Subtotal',
        'IsFlashSaleItem',
        'FlashSaleDealID',
        'ReturnStatus',
    ];

    protected $casts = [
        'IsFlashSaleItem' => 'boolean',
        'ReturnStatus' => 'string', // Cast enum to string
    ];

    /**
     * Get the order that owns the order item.
     */
    public function order(): BelongsTo // Changed from shopOrder
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    /**
     * Get the product variant associated with the order item.
     */
    public function productVariant(): BelongsTo // Changed from product
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
