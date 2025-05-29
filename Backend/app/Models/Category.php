<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product;

class Category extends Model
{
    use HasFactory;

    protected $table = 'platformcategories';
    protected $primaryKey = 'CategoryID';

    protected $fillable = [
        'Name',
        'Description',
        'ParentCategoryID',
        'Slug',
        'ImageURL',
        'IsActive',
    ];

    protected $casts = [
        'IsActive' => 'boolean',
    ];

    public $timestamps = true;
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    /**
     * Get the child categories for the category.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'ParentCategoryID', 'CategoryID');
    }

    /**
     * Get the parent category for the category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'ParentCategoryID', 'CategoryID');
    }

    /**
     * Get the products for the category.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'CategoryID', 'CategoryID');
    }

    // Removed primaryImage relationship as it's incorrect for categories
}
