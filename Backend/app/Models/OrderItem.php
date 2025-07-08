<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'orderitems';
    protected $primaryKey = 'OrderItemID';

    protected $fillable = [
        'OrderID', 'VariantID', 'Quantity', 'PriceAtPurchase', 
        'Subtotal', 'IsFlashSaleItem', 'FlashSaleDealID', 'ReturnStatus'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'OrderID', 'OrderID');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }
}