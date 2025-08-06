<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderBuyer extends Model
{
    use HasFactory;

    protected $table = 'ordersbuyer';

    /**
     * Tên của cột khóa chính.
     */
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
    ];

    protected $casts = [
        'OrderDate' => 'datetime',
        'CreatedAt' => 'datetime',
        'UpdatedAt' => 'datetime',
        'PaymentMethod' => 'string',
        'PaymentStatus' => 'string',
        'OverallStatus' => 'string',
    ];

    // Mối quan hệ với bảng users
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    // Mối quan hệ với bảng addresses
    public function address()
    {
        return $this->belongsTo(Address::class, 'ShippingAddressID', 'AddressID');
    }

    // Mối quan hệ với bảng orderitems
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID');
    }

    // Mối quan hệ với bảng returnrequests
    public function returnRequests()
    {
        return $this->hasMany(ReturnRequest::class, 'OrderID', 'OrderID');
    }
}