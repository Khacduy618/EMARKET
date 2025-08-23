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
    public $timestamps = false; // 👈 tắt auto timestamps
    protected $fillable = [
        'SellerOrderCode',
        'OrderID',
        'ShopID',
        'Status',
        'SubtotalAmount',
        'ShippingFee',
        'ShopVoucherDiscount',
        'TotalAmount',
        'TrackingCode',
        'ShippingCarrier',
        'ShippedAt',
        'DeliveredAt',
        'proof_image1',
        'proof_image2',
        'reason',
        'Notes',
        'CreatedAt'
    ];

    /**
     * Đơn hàng con thuộc về đơn hàng tổng
     */
    public function orderBuyer(): BelongsTo
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Đơn hàng con có nhiều OrderItems
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'SellerOrderID', 'SellerOrderID');
    }

    /**
     * Lấy user thông qua OrderBuyer
     */
    public function user()
    {
        return $this->hasOneThrough(
            User::class,
            OrderBuyer::class,
            'OrderID', // Foreign key on OrderBuyer
            'UserID',  // Foreign key on User
            'OrderID', // Local key on OrderSeller
            'UserID'   // Local key on OrderBuyer
        );
    }

    /**
     * Lấy địa chỉ thông qua OrderBuyer
     */
    public function address()
    {
        return $this->hasOneThrough(
            Address::class,
            OrderBuyer::class,
            'OrderID',     // Foreign key on OrderBuyer
            'AddressID',   // Foreign key on Address
            'OrderID',     // Local key on OrderSeller
            'ShippingAddressID' // Local key on OrderBuyer
        );
    }
}