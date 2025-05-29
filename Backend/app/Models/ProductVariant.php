<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use App\Models\CartItem;
use App\Models\OrderItem;
use App\Models\FlashSaleDeal;
use App\Models\AttributeValue;

class ProductVariant extends Model
{
    use HasFactory;

    protected $primaryKey = 'VariantID';

    protected $fillable = [
        'ProductID',
        'SKU',
        'Price',
        'CompareAtPrice',
        'StockQuantity',
        'ImageURL',
        'IsActive',
    ];

    /**
     * Get the product that the variant belongs to.
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    /**
     * Get the cart items for the product variant.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'VariantID', 'VariantID');
    }

    /**
     * Get the order items for the product variant.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'VariantID', 'VariantID');
    }

    /**
     * Get the flash sale deals for the product variant.
     */
    public function flashSaleDeals()
    {
        return $this->hasMany(FlashSaleDeal::class, 'VariantID', 'VariantID');
    }

    /**
     * Get the attribute values for the product variant.
     */
    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'ProductVariantAttribute', 'VariantID', 'AttributeValueID');
    }
}
