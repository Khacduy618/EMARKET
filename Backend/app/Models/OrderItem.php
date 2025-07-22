<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'orderitems';
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

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }
    
    
    public function flashSaleDeal()
    {
        return $this->belongsTo(EnrollFlashSale::class, 'FlashSaleDealID', 'EFSID');
    }
}