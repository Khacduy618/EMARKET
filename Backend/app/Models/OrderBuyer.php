<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderBuyer extends Model
{
    use HasFactory;

    protected $table = 'orders_buyer'; // Specify the table name

    protected $primaryKey = 'OrderID';

    protected $fillable = [
        'OrderCode',
        'UserID_Buyer',
        'TotalAmount',
        'ShippingAddressID',
        'ShippingFullName',
        'ShippingPhoneNumber',
        'ShippingStreet',
        'ShippingWard',
        'ShippingDistrict',
        'ShippingCity',
        'Notes',
        'PaymentMethod',
        'PaymentStatus',
        'OverallStatus',
        'PlatformVoucherCode',
        'PlatformDiscountAmount',
    ];

    /**
     * Get the user that placed the order.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'UserID_Buyer', 'UserID');
    }

    /**
     * Get the shipping address for the order.
     */
    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'ShippingAddressID', 'AddressID');
    }

    /**
     * Get the shop orders for the buyer order.
     */
    public function shopOrders()
    {
        return $this->hasMany(ShopOrder::class, 'OrderID', 'OrderID');
    }
}
