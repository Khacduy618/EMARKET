<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderBuyer;

class ProductReview extends Model
{
    use HasFactory;

    protected $primaryKey = 'ReviewID';

    protected $fillable = [
        'ProductID',
        'UserID',
        'OrderID',
        'Rating',
        'Comment',
        'ReviewImages',
        'IsApproved',
    ];

    protected $casts = [
        'Rating' => 'integer',
        'ReviewImages' => 'array',
        'IsApproved' => 'boolean',
    ];

    /**
     * Get the product that the review belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    /**
     * Get the user who created the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the order that the review is associated with.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }
}
