<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $primaryKey = 'ShopID';

    protected $fillable = [
        'UserID_Owner',
        'ShopName',
        'Description',
        'LogoURL',
        'CoverImageURL',
        'ShopAddress',
        'ShopPhone',
        'AverageRating',
        'Status',
    ];

    /**
     * Get the user that owns the shop.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'UserID_Owner', 'UserID');
    }

    /**
     * Get the products for the shop.
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the shop orders for the shop.
     */
    public function shopOrders()
    {
        return $this->hasMany(ShopOrder::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the shop reviews for the shop.
     */
    public function shopReviews()
    {
        return $this->hasMany(ShopReview::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the shop follows for the shop.
     */
    public function shopFollows()
    {
        return $this->hasMany(ShopFollow::class, 'ShopID', 'ShopID');
    }
}
