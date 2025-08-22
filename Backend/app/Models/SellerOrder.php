<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerOrder extends Model
{
    use HasFactory;

    protected $table = 'ordersseller'; // Explicitly define table name

    protected $primaryKey = 'SellerOrderID'; // Explicitly define primary key
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';
    /**
     * A SellerOrder belongs to one main OrderBuyer.
     */
    public function orderBuyer()
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    /**
     * A SellerOrder has many OrderItems.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'SellerOrderID', 'SellerOrderID');
    }

    /**
     * A SellerOrder belongs to a Shop.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }
}