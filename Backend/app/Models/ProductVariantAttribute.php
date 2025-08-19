<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariantAttribute extends Model
{
    protected $table = 'productvariantattribute';
    public $timestamps = false;
    protected $fillable = ['VariantID', 'AttributeValueID'];

    /**
     * Mối quan hệ để lấy thông tin chi tiết của AttributeValue (giá trị thuộc tính).
     */
    public function attributeValue(): BelongsTo
    {
        return $this->belongsTo(AttributeValue::class, 'AttributeValueID', 'AttributeValueID');
    }
}