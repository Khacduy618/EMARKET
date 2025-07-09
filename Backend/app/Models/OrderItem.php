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
        'OrderID',
        'VariantID',
        'Quantity',
        'PriceAtPurchase',
        'Subtotal',
        'IsFlashSaleItem',
        'FlashSaleDealID',
        'ReturnStatus',
    ];

    protected $casts = [
        'IsFlashSaleItem' => 'boolean',
        'ReturnStatus' => 'string',
        'CreatedAt' => 'datetime',
    ];

    // Mối quan hệ với bảng ordersbuyer
    public function order()
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    // Mối quan hệ với bảng productvariants
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }

    // Mối quan hệ với bảng enrollflashsale
    public function flashSaleDeal()
    {
        return $this->belongsTo(EnrollFlashSale::class, 'FlashSaleDealID', 'EFSID');
    }

    // Mối quan hệ với bảng returnrequests
    public function returnRequest()
    {
        return $this->hasOne(ReturnRequest::class, 'OrderItemID', 'OrderItemID');
    }
}