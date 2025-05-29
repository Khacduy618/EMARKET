<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Shop;

class ShopFollow extends Model
{
    use HasFactory;

    protected $primaryKey = 'FollowID';

    protected $fillable = [
        'UserID', // Changed from UserID_Buyer
        'ShopID',
    ];

    /**
     * Get the user who follows the shop.
     */
    public function user(): BelongsTo // Changed from buyer
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the shop that is being followed.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }
}
