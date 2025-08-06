<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $OrderID
 * @property string $OrderCode
 * @property int $UserID
 * @property string $OrderDate
 * @property int $TotalAmount
 * @property int $SubtotalAmount
 * @property int $ShippingFee
 * @property int $DiscountAmount
 * @property int $ShippingAddressID
 * @property string $ShippingFullName
 * @property string $ShippingPhoneNumber
 * @property string|null $Notes
 * @property string $PaymentMethod
 * @property string $PaymentStatus
 * @property string $OverallStatus
 * @property string|null $PlatformVoucherCode
 * @property float $PlatformDiscountAmount
 */
class OrderBuyer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ordersbuyer';

    /**
     * Tên của cột khóa chính.
     */
    protected $primaryKey = 'OrderID';

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
    ];

    protected $casts = [
        'OrderDate' => 'datetime',
        'PlatformDiscountAmount' => 'float',
    ];

    /**
     * Get the customer who placed the order.
     */
    public function user(): BelongsTo
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
     * Get the items in the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID');
    }
}