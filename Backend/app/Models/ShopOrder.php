<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopOrder extends Model
{
    use HasFactory;

    protected $primaryKey = 'ShopOrderID';

    protected $fillable = [
        'OrderID',
        'ShopID',
        'ShopOrderCode',
        'SubtotalForShop',
        'ShippingFeeForShop',
        'ShopVoucherCode',
        'ShopDiscountAmount',
        'TotalAmountForShop',
        'ShopOrderStatus',
        'EstimatedDeliveryDate',
        'TrackingNumber',
        'ShippingProvider',
    ];

    /**
     * Get the order that owns the shop order.
     */
    public function order()
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    /**
     * Get the shop that owns the shop order.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the order items for the shop order.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'ShopOrderID', 'ShopOrderID');
    }

    /**
     * Get the return requests for the shop order.
     */
    public function returnRequests()
    {
        return $this->hasMany(ReturnRequest::class, 'ShopOrderID', 'ShopOrderID');
    }

    /**
     * Get the shop reviews for the shop order.
     */
    public function shopReviews()
    {
        return $this->hasMany(ShopReview::class, 'ShopOrderID', 'ShopOrderID');
    }

    /**
     * Get the user used vouchers for the shop order.
     */
    public function userUsedVouchers()
    {
        return $this->hasMany(UserUsedVoucher::class, 'ShopOrderID', 'ShopOrderID');
    }
}
