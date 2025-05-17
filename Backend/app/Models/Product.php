<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'ProductID';

    protected $fillable = [
        'ShopID', 'CategoryID', 'Name', 'Description', 'SKU', 'Price',
        'StockQuantity', 'IsActive', 'AdminApprovalStatus', 'ReasonForRejection',
        'AverageRating', 'ViewCount', 'SoldCount'
    ];

    public $timestamps = true;
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';
}
