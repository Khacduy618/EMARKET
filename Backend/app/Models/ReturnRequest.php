<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\OrderBuyer;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Shop;

class ReturnRequest extends Model
{
    use HasFactory;
     protected $table = 'returnrequests';
    protected $primaryKey = 'ReturnRequestID';
     const CREATED_AT = 'RequestedAt';

    /**
     * Định nghĩa lại tên cột 'updated_at' mặc định của Laravel.
     */
    const UPDATED_AT = 'LastUpdatedAt';
    protected $fillable = [
        'OrderID', // Changed from ShopOrderID
        'OrderItemID',
        'UserID', // Changed from UserID_Buyer
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
        'RequestType' => 'string', // Cast enums to string
        'Status' => 'string',
        'ResolutionType' => 'string',
        'RefundAmount' => 'decimal:2',
    ];

    /**
     * Get the order that the return request belongs to.
     */
    public function order(): BelongsTo // Changed from shopOrder
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    /**
     * Get the order item associated with the return request.
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'OrderItemID', 'OrderItemID');
    }

    /**
     * Get the user who made the return request.
     */
    public function user(): BelongsTo // Changed from buyer
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the shop associated with the return request.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    // Removed shopOrder relationship as it's not in the schema
}