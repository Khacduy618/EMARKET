<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Product;
use App\Models\ShopFollow;
use App\Models\ReturnRequest;
use App\Models\Voucher;

class Shop extends Model
{
    use HasFactory;

    protected $table = 'Shops';

    protected $primaryKey = 'ShopID';
     public $timestamps = false;
    protected $fillable = [
        'UserID', // Changed from UserID_Owner
        'ShopName',
        'Description',
        'LogoURL',
        'CoverImageURL',
        'AddressStreet', // Updated address fields
        'AddressWard',
        'AddressDistrict',
        'AddressCity',
        'ShopPhone',
        'Level', // Added Level from schema
        'Status',
        'Cccd_front',
        'Cccd_back',
    ];

    protected $casts = [
        // Add casts if needed, e.g., for Level enum
    ];

    /**
     * Get the user that owns the shop.
     */
    public function user(): BelongsTo // Renamed owner to user
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the products for the shop.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the shop follows for the shop.
     */
    public function shopFollows(): HasMany
    {
        return $this->hasMany(ShopFollow::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the return requests for the shop.
     */
    public function returnRequests(): HasMany
    {
        return $this->hasMany(ReturnRequest::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the vouchers created by the shop.
     */
    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class, 'ShopID', 'ShopID');
    }

    // Removed shopOrders and shopReviews relationships as they are not in the schema
    // Removed AverageRating as it's not in the schema
}