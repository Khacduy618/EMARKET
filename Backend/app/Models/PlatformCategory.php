<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class PlatformCategory extends Model {
    use HasFactory;

    protected $table = 'platformcategories';
    protected $primaryKey = 'CategoryID';
    public $timestamps = true;

    protected $fillable = [
        'Name',
        'ParentCategoryID',
        'Slug',
        'ImageURL',
        'IsActive',
        'Deleted'
    ];

    protected $casts = [
        'IsActive' => 'boolean',
    ];

    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->Slug) && !empty($model->Name)) {
                $model->Slug = static::createUniqueSlug($model->Name, $model->CategoryID);
            }
        });
    }
    public function parent()
    {
        return $this->belongsTo(PlatformCategory::class, 'ParentCategoryID', 'CategoryID');
    }

    public function children()
    {
        return $this->hasMany(PlatformCategory::class, 'ParentCategoryID', 'CategoryID');
    }
    
    protected static function createUniqueSlug($name, $ignoreId = null)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('Slug', $slug)
            ->when($ignoreId, function ($query) use ($ignoreId) {
                return $query->where('CategoryID', '!=', $ignoreId);
            })
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
