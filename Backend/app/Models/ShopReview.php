<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopReview extends Model
{
    use HasFactory;

    protected $primaryKey = 'ReviewID';

    protected $fillable = [
        'ShopID',
        'UserID_Buyer',
        'ShopOrderID',
        'Rating',
        'Comment',
        'IsApproved',
    ];

    /**
     * Get the shop that the review belongs to.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the buyer user who wrote the review.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'UserID_Buyer', 'UserID');
    }

    /**
     * Get the shop order associated with the review.
     */
    public function shopOrder()
    {
        return $this->belongsTo(ShopOrder::class, 'ShopOrderID', 'ShopOrderID');
    }
}
