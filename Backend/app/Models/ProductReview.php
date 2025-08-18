<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    use HasFactory;

    // Chỉ định tên bảng nếu nó không theo quy tắc của Laravel (reviews)

    // Chỉ định khóa chính
    protected $primaryKey = 'ReviewID';

    // Khai báo tên cột timestamp của bạn
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    // Các trường được phép gán hàng loạt
    protected $fillable = [
        'VariantID',
        'UserID',
        'OrderID',
        'Rating',
        'Comment',
        'ReviewImages',
        'ReviewVideo',
        'Status',
        'HelpFul',
        'ShopReply'
    ];

    // Tự động chuyển đổi cột ReviewImages (kiểu TEXT chứa JSON) thành mảng
    protected $casts = [
        'ReviewImages' => 'array',
        'Rating' => 'integer',
    ];

    // Định nghĩa các mối quan hệ (giữ nguyên như trước)
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }
}