<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttributeValue extends Model
{
    use HasFactory;

    protected $table = 'attributevalues'; // Tên bảng giả định
    protected $primaryKey = 'AttributeValueID';
    public $timestamps = false; // Giả sử

    protected $fillable = ['AttributeID', 'Value'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'AttributeID', 'AttributeID');
    }

    public function productVariants()
    {
        return $this->belongsToMany(ProductVariant::class, 'productvariantattribute', 'AttributeValueID', 'VariantID');
    }
}