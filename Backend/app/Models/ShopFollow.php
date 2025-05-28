<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopFollow extends Model
{
    use HasFactory;

    protected $primaryKey = 'FollowID';

    protected $fillable = [
        'UserID_Buyer',
        'ShopID',
    ];

    /**
     * Get the buyer user who follows the shop.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'UserID_Buyer', 'UserID');
    }

    /**
     * Get the shop that is being followed.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }
}
