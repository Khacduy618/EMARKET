<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class ProductImage extends Model
// {
//     protected $table = 'productimages'; 

//     protected $fillable = [
//         'ProductID',
//         'ImageURL',
//         'IsPrimary',
//         'SortOrder',
//     ];

//     public $timestamps = false; 
// }
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $table = 'ProductImages'; // đúng tên bảng
    protected $primaryKey = 'ImageID'; // đúng khóa chính

    public $timestamps = false; // nếu bảng không có created_at, updated_at

    protected $fillable = ['ProductID', 'ImageURL', 'IsPrimary', 'SortOrder', 'CreatedAt'];

    // Quan hệ ngược lại: mỗi ảnh thuộc 1 sản phẩm
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID');
    }
}
