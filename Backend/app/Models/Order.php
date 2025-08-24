<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'ordersbuyer';
    protected $primaryKey = 'OrderID';
    protected $appends = ['is_return_eligible'];
    protected $fillable = [
        'OrderCode', 'UserID', 'TotalAmount', 'SubtotalAmount', 'ShippingFee', 
        'DiscountAmount', 'ShippingAddressID', 'ShippingFullName', 
        'ShippingPhoneNumber', 'Notes', 'PaymentMethod', 
        'OverallStatus', 'PlatformVoucherCode', 'PlatformDiscountAmount'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'ShippingAddressID', 'AddressID');
    }
    public function getIsReturnEligibleAttribute()
{
    // Chỉ những đơn hàng đã giao mới có thể được xét
    if ($this->OverallStatus !== 'Delivered' && $this->OverallStatus !== 'Completed') {
        return false;
    }
    // Trả về true nếu CÒN HẠN, false nếu HẾT HẠN.
    return ! \Carbon\Carbon::parse($this->UpdatedAt)->addDays(3)->isPast();
}
}