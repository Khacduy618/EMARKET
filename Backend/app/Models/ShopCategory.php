<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopCategory extends Model
{
    protected $table = 'shopcategories';
    protected $primaryKey = 'ShopCategoryID';
    protected $fillable = ['ShopID', 'CategoryID', 'Status', 'RequestedAt', 'ApprovedAt', 'RejectedReason'];
    public $timestamps = false;

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    public function category()
    {
        return $this->belongsTo(PlatformCategory::class, 'CategoryID', 'CategoryID');
    }
}