<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class Product extends Model
// {
//     protected $table = 'products';
//     protected $primaryKey = 'ProductID';

//     protected $fillable = [
//         'ShopID', 'CategoryID', 'Name', 'Description', 'SKU', 'Price',
//         'StockQuantity', 'IsActive', 'AdminApprovalStatus', 'ReasonForRejection',
//         'AverageRating', 'ViewCount', 'SoldCount'
//     ];
//     protected $appends = ['final_price'];

//     public function getFinalPriceAttribute()
//     {
//         return $this->price - ($this->price * ($this->discount / 100));
//     }
    
//     public $timestamps = true;
//     const CREATED_AT = 'CreatedAt';
//     const UPDATED_AT = 'UpdatedAt';
//     public function primaryImage()
//     {
//         return $this->hasOne(ProductImage::class, 'ProductID', 'ProductID')->where('IsPrimary', 1);
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
// Import ProductImage nếu bạn có Model này và muốn type hinting
// use App\Models\ProductImage;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'ProductID';

    protected $fillable = [
        'ShopID', 'CategoryID', 'Name', 'Description', 'SKU', 'Price',
        'discount', // Đảm bảo cột 'discount' tồn tại trong bảng 'products' nếu bạn dùng nó
        'StockQuantity', 'IsActive', 'AdminApprovalStatus', 'ReasonForRejection',
        'AverageRating', 'ViewCount', 'SoldCount'
    ];

    // Không cần $appends = ['ImageURL'] nếu bạn chủ động trả về ImageURL từ controller.
    // Nếu bạn muốn nó luôn có khi model được serialize (ví dụ $product->toArray()), thì giữ lại.
    // protected $appends = ['ImageURL'];

    protected $casts = [
        'Price' => 'decimal:2',
        'discount' => 'integer', // Hoặc float, tùy cách lưu trữ
        'IsActive' => 'boolean',
        'AverageRating' => 'float',
    ];

    public $timestamps = true;
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    /**
     * Quan hệ để lấy tất cả hình ảnh của sản phẩm.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'ProductID', 'ProductID')->orderBy('SortOrder', 'asc');
    }

    /**
     * Quan hệ để lấy ảnh đại diện (IsPrimary = true) của sản phẩm.
     */
    public function primaryImage(): HasOne
    {
        // Giả sử ProductImage model tồn tại
        return $this->hasOne(ProductImage::class, 'ProductID', 'ProductID')->where('IsPrimary', true);
    }

    /**
     * Quan hệ với FlashSale.
     */
    public function flashSales(): HasMany
    {
        return $this->hasMany(FlashSale::class, 'product_id', 'ProductID');
    }

    /**
     * Accessor để lấy ImageURL.
     * Ưu tiên ảnh chính, sau đó đến ảnh đầu tiên, cuối cùng là placeholder.
     * Hàm này sẽ được gọi nếu bạn truy cập $product->ImageURL.
     */
    public function getImageURLAttribute(): string // Luôn trả về string (URL hoặc placeholder)
    {
        // 1. Thử lấy ảnh chính từ quan hệ (nếu đã eager load thì tốt, không thì sẽ query)
        // Kiểm tra xem quan hệ primaryImage đã được load và có giá trị không
        $primaryImageModel = $this->relationLoaded('primaryImage') ? $this->primaryImage : $this->primaryImage()->first();

        if ($primaryImageModel && !empty($primaryImageModel->ImageURL)) {
            $imagePathOrUrl = $primaryImageModel->ImageURL;
            // Kiểm tra xem có phải URL đầy đủ không
            if (filter_var($imagePathOrUrl, FILTER_VALIDATE_URL)) {
                return $imagePathOrUrl;
            }
            // Nếu là đường dẫn tương đối trong storage
            return asset('storage/' . ltrim($imagePathOrUrl, '/'));
        }

        // 2. Nếu không có ảnh chính, thử lấy ảnh đầu tiên từ danh sách ảnh
        // Kiểm tra xem quan hệ images đã được load và có giá trị không
        $imagesCollection = $this->relationLoaded('images') ? $this->images : $this->images()->get();
        $firstImageModel = $imagesCollection->first();

        if ($firstImageModel && !empty($firstImageModel->ImageURL)) {
            $imagePathOrUrl = $firstImageModel->ImageURL;
            if (filter_var($imagePathOrUrl, FILTER_VALIDATE_URL)) {
                return $imagePathOrUrl;
            }
            return asset('storage/' . ltrim($imagePathOrUrl, '/'));
        }

        // 3. Fallback sang placeholder nếu không có ảnh nào
        if ($this->ProductID) { // Đảm bảo ProductID có giá trị
            $placeholders = [
                'https://via.placeholder.com/300x300.png/0077be?text=Sản+phẩm+' . $this->ProductID,
                'https://via.placeholder.com/300x300.png/ff8800?text=Hàng+' . $this->ProductID,
                'https://via.placeholder.com/300x300.png/e40045?text=Sale+' . $this->ProductID,
            ];
            // Đảm bảo mảng placeholders không rỗng
            if (count($placeholders) > 0) {
                 return $placeholders[intval($this->ProductID) % count($placeholders)];
            }
        }
        return 'https://via.placeholder.com/300x300.png/cccccc?text=No+Image'; // Placeholder mặc định cuối cùng
    }
}