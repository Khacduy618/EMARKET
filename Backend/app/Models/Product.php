<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Shop;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\ProductReview;

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'ProductID';

    protected $fillable = [
        'ShopID',
        'CategoryID',
        'Name',
        'Description',
        'Discount', // Keep Discount as it's in the Products table in the schema
        'IsActive',
        'AdminApprovalStatus',
        'ReasonForRejection',
    ];

    protected $casts = [
        'IsActive' => 'boolean',
    ];

    /**
     * Get the shop that owns the product.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the category that the product belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'CategoryID', 'CategoryID');
    }

    /**
     * Get the product variants for the product.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'ProductID', 'ProductID');
    }

    /**
     * Get the product images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'ProductID', 'ProductID')->orderBy('SortOrder', 'asc');
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class, 'ProductID', 'ProductID')->where('IsPrimary', true);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'ProductID', 'ProductID');
    }

    // Removed FlashSale relationship as deals are linked to variants
    // Removed SKU, Price, StockQuantity, AverageRating, ViewCount, SoldCount as they are in ProductVariants
    // Removed getFinalPriceAttribute and getImageURLAttribute as they should be handled by ProductVariant or elsewhere

    public $timestamps = true;
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';
}
