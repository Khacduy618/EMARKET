<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $primaryKey = 'CartItemID';

    protected $fillable = [
        'CartID',
        'ProductID',
        'ShopID',
        'Quantity',
    ];

    /**
     * Get the cart that owns the cart item.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class, 'CartID', 'CartID');
    }

    /**
     * Get the product associated with the cart item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    /**
     * Get the shop associated with the cart item.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }
}
