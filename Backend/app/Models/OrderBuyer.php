<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBuyer extends Model
{
    protected $table = 'ordersbuyer';
    protected $primaryKey = 'OrderID';
    public $timestamps = false;
    protected $fillable = [
        'OrderCode',
        'UserID',
        'ShopID',
        'OrderDate',
        'TotalAmount',
        'SubtotalAmount',
        'ShippingFee',
        'DiscountAmount',
        'ShippingAddressID',
        'ShippingFullName',
        'ShippingPhoneNumber',
        // thêm các cột khác nếu cần
    ];
    protected $casts = [
        'OrderDate' => 'datetime',
        'CreatedAt' => 'datetime',
        'UpdatedAt' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'OrderID', 'OrderID');
    }

    public function address()
    {
        return $this->belongsTo(Address::class, 'ShippingAddressID', 'AddressID');
    }
}