<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductVariant;

class CartItem extends Model
{
    use HasFactory;
protected $table = 'CartItems';
    protected $primaryKey = 'CartItemID';

    protected $fillable = [
        'CartID',
        'VariantID',
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
     * Get the product variant associated with the cart item.
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }

    /**
     * Get the shop associated with the cart item.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }
}
