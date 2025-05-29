<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product;

class ProductImage extends Model
{
    use HasFactory;

    protected $primaryKey = 'ImageID';

    protected $fillable = [
        'ProductID',
        'ImageURL',
        'IsPrimary',
        'SortOrder',
    ];

    protected $casts = [
        'IsPrimary' => 'boolean',
    ];

    public $timestamps = true; // Schema includes CreatedAt, so enable timestamps
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = null; // Schema does not include UpdatedAt

    /**
     * Get the product that the image belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }
}
