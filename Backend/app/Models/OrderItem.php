<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $primaryKey = 'OrderItemID';

    protected $fillable = [
        'ShopOrderID',
        'ProductID',
        'Quantity',
        'PriceAtPurchase',
        'Subtotal',
        'ReturnStatus',
    ];

    /**
     * Get the shop order that owns the order item.
     */
    public function shopOrder()
    {
        return $this->belongsTo(ShopOrder::class, 'ShopOrderID', 'ShopOrderID');
    }

    /**
     * Get the product associated with the order item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    /**
     * Get the return request for the order item.
     */
    public function returnRequest()
    {
        return $this->hasOne(ReturnRequest::class, 'OrderItemID', 'OrderItemID');
    }
}
