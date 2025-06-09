<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class NewArrivalModel extends Model
{
    use HasFactory;

    protected $primaryKey = 'VariantID';
    public $timestamps = false;

    protected $fillable = [
        'ProductID', 'SKU', 'Price', 'CompareAtPrice', 'StockQuantity', 'ImageURL', 'IsActive'
    ];

    protected $casts = [
        'Price' => 'integer',
        'CompareAtPrice' => 'integer',
        'StockQuantity' => 'integer',
        'IsActive' => 'boolean',
        'CreatedAt' => 'datetime',
        'UpdatedAt' => 'datetime',
    ];

    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    // --- Accessors ---
    public function getFormattedPriceAttribute(): string
    {
        // Giả sử Price lưu dạng cents (số nguyên)
        return number_format($this->Price / 100, 0, ',', '.') . '₫';
    }

    public function getFormattedCompareAtPriceAttribute(): ?string
    {
        if (!$this->CompareAtPrice) {
            return null;
        }
        return number_format($this->CompareAtPrice / 100, 0, ',', '.') . '₫';
    }

    public function getDiscountPercentageAttribute(): ?int
    {
        if ($this->CompareAtPrice && $this->Price < $this->CompareAtPrice && $this->CompareAtPrice > 0) {
            return round((($this->CompareAtPrice - $this->Price) / $this->CompareAtPrice) * 100);
        }
        return null;
    }

    public function getVariantImageUrlAttribute(): ?string
    {
        return $this->ImageURL ? Storage::url($this->ImageURL) : null;
    }
}