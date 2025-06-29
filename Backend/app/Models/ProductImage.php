<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $table = 'ProductImages'; // đúng tên bảng
    protected $primaryKey = 'ImageID'; // đúng khóa chính


    public $timestamps = true; // Bật tính năng timestamp
    const CREATED_AT = 'CreatedAt'; // Chỉ định tên cột "created at"
    const UPDATED_AT = null; // Báo cho Eloquent biết không có cột "updated at"

    /**
     * Các thuộc tính có thể được gán hàng loạt (mass-assignable).
     * Không cần đưa 'CreatedAt' vào đây vì Eloquent sẽ tự động xử lý.
     */
    protected $fillable = [
        'ProductID',
        'ImageURL',
        'IsPrimary',
        'SortOrder',
    ];

    /**
     * Định nghĩa quan hệ ngược lại: mỗi ảnh thuộc về một sản phẩm.
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }
}