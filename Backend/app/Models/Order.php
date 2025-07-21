<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'ordersbuyer';
    protected $primaryKey = 'OrderID';

    protected $fillable = [
        'OrderCode', 'UserID', 'TotalAmount', 'SubtotalAmount', 'ShippingFee', 
        'DiscountAmount', 'ShippingAddressID', 'ShippingFullName', 
        'ShippingPhoneNumber', 'Notes', 'PaymentMethod', 'PaymentStatus', 
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
}