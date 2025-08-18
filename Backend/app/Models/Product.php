<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Shop;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

// Import ProductImage nếu bạn có Model này và muốn type hinting
// use App\Models\ProductImage;

class Product extends Model
{
    use HasFactory;

    protected $table = 'Products';
    

    protected $primaryKey = 'ProductID';
    public $timestamps = false; 
    protected $fillable = [
        'ShopID', 'CategoryID', 'Name', 'Description',
        'discount', // Đảm bảo cột 'discount' tồn tại trong bảng 'products' nếu bạn dùng nó
        'StockQuantity', 'IsActive', 'AdminApprovalStatus', 'ReasonForRejection', 'ViewCount', 'SoldCount', 
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
 
     // Mối quan hệ để lấy tất cả các biến thể của sản phẩm
     public function variants()
     {
         return $this->hasMany(ProductVariant::class, 'ProductID', 'ProductID');
     }
 
     // Helper để lấy biến thể đầu tiên (hoặc có thể là biến thể "mặc định")
     public function defaultVariant()
     {
         return $this->hasOne(ProductVariant::class, 'ProductID', 'ProductID')
                     // ->where('IsDefault', 1) // Nếu bạn có cờ IsDefault
                     ->orderBy('VariantID', 'asc'); // Hoặc sắp xếp theo một tiêu chí nào đó
     }
     public function scopeActiveApproved($query) // <<<< PHƯƠNG THỨC SCOPE
     {
         return $query->where('IsActive', true)
                      ->where('AdminApprovalStatus', 'Approved');
     }

      public function scopeWithAttributes(Builder $query): Builder
    {
        return $query->whereExists(function ($subQuery) {
            $subQuery->select(DB::raw(1))
                  ->from('ProductVariants as pv_check')
                  ->join('ProductVariantAttribute as pva_check', 'pv_check.VariantID', '=', 'pva_check.VariantID')
                  ->join('AttributeValues as av_check', 'pva_check.AttributeValueID', '=', 'av_check.AttributeValueID')
                  ->join('Attributes as attr_check', 'av_check.AttributeID', '=', 'attr_check.AttributeID')
                  ->whereColumn('pv_check.ProductID', 'products.ProductID'); // 'products' là tên bảng mặc định của model Product
        });
    }
     ////////////////////////////////////////////////
     public function getSlugAttribute(): ?string
    {
        if ($this->Name) { // Kiểm tra xem Name có tồn tại không
            return Str::slug($this->Name);
        }
        return null; // Trả về null nếu Name không có
    }

    /**
     * Accessor để lấy mô tả ngắn của sản phẩm.
     * Sẽ được gọi khi bạn truy cập $product->short_description
     */
    public function getShortDescriptionAttribute(): ?string
    {
        if ($this->Description) { // Kiểm tra xem Description có tồn tại không
            return Str::limit($this->Description, 100); // Giới hạn 100 ký tự
        }
        return null; // Trả về null nếu Description không có
    }

    /**
     * Accessor để lấy URL ảnh chính của sản phẩm.
     * Sẽ được gọi khi bạn truy cập $product->main_image_url
     */
    public function getMainImageUrlAttribute(): string // Luôn trả về string (URL hoặc placeholder)
    {
        // 1. Ưu tiên ảnh từ relationship primaryImage()
        // $this->primaryImage sẽ tự động thực hiện query nếu relationship chưa được load.
        // Nếu đã eager load 'primaryImage', nó sẽ dùng dữ liệu đã load.
        $primaryImageModel = $this->primaryImage; // Access relationship trực tiếp

        if ($primaryImageModel && !empty($primaryImageModel->ImageURL)) {
            // Kiểm tra xem ImageURL có phải là URL đầy đủ không
            if (filter_var($primaryImageModel->ImageURL, FILTER_VALIDATE_URL)) {
                return $primaryImageModel->ImageURL;
            }
            // Nếu là đường dẫn tương đối, sử dụng Storage::url()
            return Storage::url($primaryImageModel->ImageURL);
        }

        // 2. Fallback: thử lấy ảnh từ default variant nếu variant có ảnh riêng
        // $this->defaultVariant cũng sẽ tự động query nếu chưa eager load
        $defaultVariantModel = $this->defaultVariant;
        if ($defaultVariantModel) {
            // Giả sử ProductVariant có accessor là `variant_image_url`
            if (method_exists($defaultVariantModel, 'getVariantImageUrlAttribute') && $defaultVariantModel->variant_image_url) {
                return $defaultVariantModel->variant_image_url;
            } elseif (!empty($defaultVariantModel->ImageURL)) { // Hoặc nếu variant có trường ImageURL trực tiếp
                if (filter_var($defaultVariantModel->ImageURL, FILTER_VALIDATE_URL)) {
                    return $defaultVariantModel->ImageURL;
                }
                return Storage::url($defaultVariantModel->ImageURL);
            }
        }

        // 3. Fallback: Lấy ảnh đầu tiên từ collection 'images'
        // $this->images sẽ tự động query nếu chưa eager load
        $firstImageModel = $this->images()->orderBy('SortOrder')->first(); // Lấy ảnh đầu tiên theo SortOrder
        if ($firstImageModel && !empty($firstImageModel->ImageURL)) {
            if (filter_var($firstImageModel->ImageURL, FILTER_VALIDATE_URL)) {
                return $firstImageModel->ImageURL;
            }
            return Storage::url($firstImageModel->ImageURL);
        }

        // 4. Fallback cuối cùng: Placeholder
        // Bạn có thể tùy chỉnh logic placeholder này
        if ($this->ProductID) {
            $placeholders = [
                'https://via.placeholder.com/300x300.png/0077be?text=Sản+phẩm+' . $this->ProductID,
                'https://via.placeholder.com/300x300.png/ff8800?text=Hàng+' . $this->ProductID,
                'https://via.placeholder.com/300x300.png/e40045?text=Sale+' . $this->ProductID,
            ];
            if (count($placeholders) > 0) {
                 return $placeholders[intval($this->ProductID) % count($placeholders)];
            }
        }
        return 'https://via.placeholder.com/300x300.png/cccccc?text=No+Image';
    }

    /**
     * Accessor để tạo danh sách tags cho sản phẩm (ví dụ: MỚI NHẤT, GIẢM GIÁ).
     * Sẽ được gọi khi bạn truy cập $product->tags_list
     */
    public function getTagsListAttribute(): array
    {
        $tags = [];

        // Tag "MỚI NHẤT" nếu sản phẩm được tạo trong vòng 7 ngày qua
        if ($this->CreatedAt && $this->CreatedAt->gt(now()->subDays(7))) {
            $tags[] = "MỚI NHẤT";
        }

        // Tag "GIẢM GIÁ"
        // Ưu tiên lấy thông tin giảm giá từ defaultVariant
        $defaultVariant = $this->defaultVariant; // Access relationship trực tiếp
        if ($defaultVariant) {
            // Giả sử ProductVariant có accessor 'discount_percentage'
            if (method_exists($defaultVariant, 'getDiscountPercentageAttribute') && $defaultVariant->discount_percentage) {
                $tags[] = "GIẢM " . $defaultVariant->discount_percentage . "%";
            }
            // Hoặc tính toán trực tiếp nếu không có accessor
            elseif ($defaultVariant->CompareAtPrice && $defaultVariant->Price < $defaultVariant->CompareAtPrice && $defaultVariant->CompareAtPrice > 0) {
                $discountPercentage = round((($defaultVariant->CompareAtPrice - $defaultVariant->Price) / $defaultVariant->CompareAtPrice) * 100);
                if ($discountPercentage > 0) {
                    $tags[] = "GIẢM " . $discountPercentage . "%";
                }
            }
        } elseif ($this->Discount > 0) { // Nếu không có variant, kiểm tra discount của Product
            $tags[] = "GIẢM " . $this->Discount . "%"; // Giả sử Discount của Product là %
        }

        // Bạn có thể thêm các logic khác để tạo tags ở đây (ví dụ: "BÁN CHẠY", "NỔI BẬT" dựa trên các cột khác)

        return $tags;
    }

    /**
     * Get the shop that owns the product.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the category that the product belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'CategoryID', 'CategoryID');
    }
    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'ProductID', 'ProductID');
    }
    public function scopeActive($query)
    {
        // Giả sử cột kiểm tra active trong bảng products của bạn là 'IsActive' = 1
        return $query->where('IsActive', 1);
    }
    public function scopeApproved($query)
    {
        // Giả sử cột kiểm tra duyệt trong bảng products của bạn là 'AdminApprovalStatus' = 'Approved'
        return $query->where('AdminApprovalStatus', 'Approved');
    }
    public function scopePublishedAndAvailable(Builder $query): Builder
    {
        return $query->where('IsActive', 1)
                     ->where('AdminApprovalStatus', 'Approved')
                     // Chỉ lấy sản phẩm nào CÓ TỒN TẠI biến thể hợp lệ
                     ->whereHas('variants', function ($variantQuery) {
                         $variantQuery->where('IsActive', 1)
                                      ->where('StockQuantity', '>', 0);
                     });
    }
    public function orderItems(): HasMany
    {
        // Giả sử model của bạn là 'OrderItem' và khóa ngoại là 'ProductID'
        // 'ProductID' trong bảng OrderItems liên kết với 'ProductID' trong bảng Products
        return $this->hasMany(OrderItem::class, 'ProductID', 'ProductID');
    }

    /**
     * Scope để chỉ lấy các sản phẩm CÓ biến thể và thuộc tính được gán đầy đủ.
     * Đây là scope chúng ta cần.
     */
    public function scopeHavingAttributes(Builder $query): Builder
    {
        return $query->whereExists(function ($subQuery) {
            $subQuery->select(DB::raw(1))
                  ->from('ProductVariants as pv_check')
                  ->join('ProductVariantAttribute as pva_check', 'pv_check.VariantID', '=', 'pva_check.VariantID')
                  ->join('AttributeValues as av_check', 'pva_check.AttributeValueID', '=', 'av_check.AttributeValueID')
                  ->join('Attributes as attr_check', 'av_check.AttributeID', '=', 'attr_check.AttributeID')
                  ->whereColumn('pv_check.ProductID', 'Products.ProductID');
        });
    }

    public function followers()
    {
        // Ví dụ: return $this->belongsToMany(User::class, 'shop_followers', 'shop_id', 'user_id');
        // Tạm thời comment lại nếu bạn chưa có
        return $this->belongsToMany(User::class, 'followers', 'ShopID', 'UserID'); // Giả định có bảng followers
    }
}
