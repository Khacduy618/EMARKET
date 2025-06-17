<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformCategory extends Model
{
    protected $table = 'platformcategories';
    protected $primaryKey = 'CategoryID';
    protected $fillable = ['Name', 'Description', 'ParentCategoryID', 'Slug', 'icon', 'ImageURL', 'IsActive'];
    public $timestamps = true;

    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    public function parent()
    {
        return $this->belongsTo(PlatformCategory::class, 'ParentCategoryID', 'CategoryID');
    }

    public function children()
    {
        return $this->hasMany(PlatformCategory::class, 'ParentCategoryID', 'CategoryID');
    }
}