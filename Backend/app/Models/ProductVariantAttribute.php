<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductVariantAttribute extends Pivot // Sử dụng Pivot nếu nó chỉ là bảng trung gian
{
    protected $table = 'ProductVariantAttribute';
    // Laravel sẽ tự hiểu khóa chính là (VariantID, AttributeValueID) cho pivot table
    // Nếu không, bạn cần khai báo:
    // protected $primaryKey = ['VariantID', 'AttributeValueID'];
    // public $incrementing = false;
    public $timestamps = false; // Giả sử không có timestamps

    protected $fillable = ['VariantID', 'AttributeValueID'];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }

    public function attributeValue()
    {
        return $this->belongsTo(AttributeValue::class, 'AttributeValueID', 'AttributeValueID');
    }
    // Quan hệ: Một giá trị thuộc tính thuộc về một thuộc tính (cha)
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'AttributeID');
    }
}