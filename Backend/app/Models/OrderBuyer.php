<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Address;
use App\Models\OrderItem;
use App\Models\UserVoucher;

class OrderBuyer extends Model
{
    use HasFactory;

    protected $table = 'OrdersBuyer';
    protected $primaryKey = 'OrderID';
    public $timestamps = false;

    protected $fillable = [
        'OrderCode',
        'UserID',
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
        'TotalAmount' => 'float',
        'SubtotalAmount' => 'float',
        'ShippingFee' => 'float',
        'DiscountAmount' => 'float',
        'PaymentMethod' => 'string',
        'PaymentStatus' => 'string',
        'OverallStatus' => 'string',
        'PlatformDiscountAmount' => 'float',
    ];

    /**
     * Người dùng đã đặt đơn hàng.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Địa chỉ giao hàng.
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'ShippingAddressID', 'AddressID');
    }

    /**
     * Danh sách sản phẩm trong đơn hàng.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID');
    }

    /**
     * Danh sách voucher người dùng đã sử dụng.
     */
    public function usedVouchers(): HasMany
    {
        return $this->hasMany(UserVoucher::class, 'OrderID', 'OrderID');
    }
}
