<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    use HasFactory;

    /**
     * Tên bảng trong cơ sở dữ liệu. Laravel mặc định sẽ tìm 'product_reviews'.
     * Ta cần chỉ định rõ tên bảng là 'productreviews'.
     *
     * @var string
     */
    protected $table = 'productreviews';

    /**
     * Khóa chính của bảng.
     *
     * @var string
     */
    protected $primaryKey = 'ReviewID';

    /**
     * Tên cột 'created_at' trong database.
     *
     * @var string
     */
    const CREATED_AT = 'CreatedAt';

    /**
     * Tên cột 'updated_at' trong database.
     *
     * @var string
     */
    const UPDATED_AT = 'UpdatedAt';

    /**
     * Các thuộc tính có thể được gán hàng loạt (mass-assignable).
     * Sửa 'ProductID' thành 'VariantID' để khớp với schema.
     *
     * @var array
     */
    protected $fillable = [
        'VariantID', // Sửa từ ProductID -> VariantID
        'UserID',
        'OrderID',
        'Rating',
        'Comment',
        'ReviewImages',
        'IsApproved',
        'AdminReply', // Giả sử bạn đã thêm cột này vào DB
    ];

    /**
     * Các thuộc tính cần được ép kiểu (cast).
     *
     * @var array
     */
    protected $casts = [
        'Rating' => 'integer',
        'ReviewImages' => 'array', // Tự động encode/decode JSON
        'IsApproved' => 'boolean', // Tự động chuyển đổi tinyint(1) sang true/false
        'CreatedAt' => 'datetime',
        'UpdatedAt' => 'datetime',
    ];

    /**
     * Lấy biến thể sản phẩm (product variant) mà review này thuộc về.
     * Đây là mối quan hệ trực tiếp trong schema của bạn.
     */
     public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }

    /**
     * Lấy sản phẩm cha (product) thông qua biến thể.
     * Đây là một mối quan hệ hữu ích để lấy tên/thông tin chung của sản phẩm.
     */
    public function product()
    {
        // Sử dụng quan hệ hasOneThrough để đi từ Review -> Variant -> Product
        return $this->hasOneThrough(
            Product::class,
            ProductVariant::class,
            'VariantID', // Khóa ngoại trên bảng productvariants (trung gian)
            'ProductID', // Khóa ngoại trên bảng products (cuối)
            'VariantID', // Khóa cục bộ trên bảng productreviews
            'ProductID'  // Khóa cục bộ trên bảng productvariants (trung gian)
        );
    }

    /**
     * Lấy người dùng đã tạo review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Lấy đơn hàng mà review này được liên kết tới.
     */
    public function order(): BelongsTo
    {
        // Giả sử bạn có model OrderBuyer được cấu hình đúng
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }
}