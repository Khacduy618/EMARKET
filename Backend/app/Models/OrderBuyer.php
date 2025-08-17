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
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderBuyer extends Model
{
    use HasFactory;

    protected $table = 'OrdersBuyer';

    protected $primaryKey = 'OrderID';
    public $timestamps = false;

    /**
     * Tên của các cột timestamp.
     */
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

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
        'VnpayTxnRef',
        'VnpayTransactionNo',
        'VnpayTransactionDate'
    ];

    protected $casts = [
        'OrderDate' => 'datetime',
        'CreatedAt' => 'datetime',
        'UpdatedAt' => 'datetime',
        'PaymentMethod' => 'string',
        'TotalAmount' => 'float',
        'SubtotalAmount' => 'float',
        'ShippingFee' => 'float',
        'DiscountAmount' => 'float',
        'PaymentStatus' => 'string',
        'OverallStatus' => 'string',
        'PlatformDiscountAmount' => 'float',
    ];

    // Mối quan hệ với bảng users
    public function user()
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

    // Mối quan hệ với bảng returnrequests
    public function returnRequests()
    {
        return $this->hasMany(ReturnRequest::class, 'OrderID', 'OrderID');
    }

    // Removed shopOrders relationship as it's not in the schema
}
