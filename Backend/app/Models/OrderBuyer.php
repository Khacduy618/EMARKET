<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Address;
use App\Models\OrderItem;
use App\Models\UserVoucher; // Assuming UserVoucher is UserUsedVoucher

class OrderBuyer extends Model
{
    use HasFactory;

    protected $table = 'OrdersBuyer';

    protected $primaryKey = 'OrderID';

    protected $fillable = [
        'OrderCode',
        'UserID', // Changed from UserID_Buyer
        'OrderDate',
        'TotalAmount',
        'SubtotalAmount',
        'ShippingFee',
        'DiscountAmount',
        'ShippingAddressID',
        'ShippingFullName',
        'ShippingPhoneNumber',
        'Notes',
        'PaymentMethod',
        'PaymentStatus',
        'OverallStatus',
        'PlatformVoucherCode',
        'PlatformDiscountAmount',
    ];

    protected $casts = [
        'OrderDate' => 'datetime',
        'TotalAmount' => 'integer',
        'SubtotalAmount' => 'integer',
        'ShippingFee' => 'integer',
        'DiscountAmount' => 'integer',
        'PaymentMethod' => 'string', // Cast enums to string
        'PaymentStatus' => 'string',
        'OverallStatus' => 'string',
        'PlatformDiscountAmount' => 'decimal:2',
    ];

    /**
     * Get the user that placed the order.
     */
    public function user(): BelongsTo // Renamed buyer to user
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the shipping address for the order.
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'ShippingAddressID', 'AddressID');
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID');
    }

    /**
     * Get the user vouchers used for the order.
     */
    public function usedVouchers(): HasMany
    {
        return $this->hasMany(UserVoucher::class, 'OrderID', 'OrderID');
    }

    // Removed shopOrders relationship as it's not in the schema
}
