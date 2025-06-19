<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'ProductVariants';
    protected $primaryKey = 'VariantID';
    public $timestamps = true;

    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = [
        'ProductID', 'SKU', 'Price', 'CompareAtPrice', 'StockQuantity',
        'ImageURL', // Ảnh riêng của biến thể
        'IsActive',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    // Mối quan hệ đến ProductVariantAttribute (bảng trung gian)
    public function attributeLinks()
    {
        return $this->hasMany(ProductVariantAttribute::class, 'VariantID', 'VariantID');
    }

    // Mối quan hệ nhiều-nhiều đến AttributeValues thông qua ProductVariantAttribute
    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'productvariantattribute', 'VariantID', 'AttributeValueID');
    }
    public function getFormattedPriceAttribute(): ?string
    {
        if (!is_null($this->Price)) {
            // Giả định Price lưu là số nguyên (ví dụ: cents)
            // Nếu bạn lưu Price dưới dạng số thập phân bình thường, bỏ / 100
            return number_format($this->Price / 100, 0, ',', '.') . '₫';
        }
        return null;
    }

    /**
     * Accessor cho phần trăm giảm giá của variant.
     * Sẽ được gọi khi controller truy cập $variant->discount_percentage
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if ($this->CompareAtPrice && $this->Price < $this->CompareAtPrice && $this->CompareAtPrice > 0) {
            return round((($this->CompareAtPrice - $this->Price) / $this->CompareAtPrice) * 100);
        }
        return null;
    }
    /**
     * Accessor cho giá gốc (so sánh) đã định dạng.
     * Sẽ được gọi khi truy cập $variant->formatted_compare_at_price.
     */
    public function getFormattedCompareAtPriceAttribute(): ?string
    {
        if (!is_null($this->CompareAtPrice)) {
            // Giả định CompareAtPrice lưu là số nguyên (ví dụ: cents)
            return number_format($this->CompareAtPrice / 100, 0, ',', '.') . '₫';
        }
        return null;
    }

    /**
     * Accessor cho URL ảnh riêng của variant.
     * Sẽ được gọi khi truy cập $variant->variant_image_url.
     */

    /**
     * Accessor để chuyển đổi giá trị IsActive sang boolean.
     * Sẽ được gọi khi truy cập $variant->is_active.
     */
    public function getIsActiveAttribute($value): bool
    {
        return (bool) $value;
    }
    public function getVariantImageUrlAttribute(): ?string
    {
        if ($this->ImageURL) { // ImageURL là tên cột trong bảng productvariants
            // Kiểm tra xem có phải URL đầy đủ không
            if (filter_var($this->ImageURL, FILTER_VALIDATE_URL)) {
                return $this->ImageURL;
            }
            // Nếu là đường dẫn tương đối, loại bỏ dấu / ở đầu nếu có
            return Storage::url(ltrim($this->ImageURL, '/'));
        }
        return null; // Trả về null nếu variant không có ảnh riêng
    }
}