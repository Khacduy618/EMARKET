<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    use HasFactory;

    protected $primaryKey = 'ReturnRequestID';

    protected $fillable = [
        'ShopOrderID',
        'OrderItemID',
        'UserID_Buyer',
        'ShopID',
        'RequestType',
        'ReasonCode',
        'ReasonDescription',
        'EvidenceURLs',
        'Status',
        'SellerNote',
        'AdminNote',
        'ResolutionType',
        'RefundAmount',
        'BuyerShippingInfoForReturn',
        'ShopShippingInfoForReturn',
    ];

    protected $casts = [
        'EvidenceURLs' => 'array',
    ];

    /**
     * Get the shop order that the return request belongs to.
     */
    public function shopOrder()
    {
        return $this->belongsTo(ShopOrder::class, 'ShopOrderID', 'ShopOrderID');
    }

    /**
     * Get the order item associated with the return request.
     */
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class, 'OrderItemID', 'OrderItemID');
    }

    /**
     * Get the buyer user who made the return request.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'UserID_Buyer', 'UserID');
    }

    /**
     * Get the shop associated with the return request.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }
}
