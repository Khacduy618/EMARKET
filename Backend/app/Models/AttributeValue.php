<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Attribute;
use App\Models\ProductVariant;

class AttributeValue extends Model
{
    use HasFactory;

    protected $primaryKey = 'AttributeValueID';

    protected $fillable = [
        'AttributeID',
        'Value',
    ];

    /**
     * Get the attribute that the value belongs to.
     */
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'AttributeID', 'AttributeID');
    }

    /**
     * Get the product variants that have this attribute value.
     */
    public function productVariants()
    {
        return $this->belongsToMany(ProductVariant::class, 'ProductVariantAttribute', 'AttributeValueID', 'VariantID');
    }
}
