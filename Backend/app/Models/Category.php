<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Category extends Model
{
    protected $table = 'platformcategories';
    protected $primaryKey = 'CategoryID';

    // Cho phép mass assignment (nếu dùng create())
    protected $fillable = [
        'Name', 'Description', 'ParentCategoryID', 'Slug', 'ImageURL', 'IsActive'
    ];

    // Tắt timestamps nếu không dùng cột created_at / updated_at mặc định của Laravel
    public $timestamps = true;
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';
    //cha con category
    public function children()
    {
        return $this->hasMany(Category::class, 'ParentCategoryID');
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'ParentCategoryID');
    }
   
}