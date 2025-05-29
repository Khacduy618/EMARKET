<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSaleDeal extends Model
{
    use HasFactory;

    protected $primaryKey = 'DealID';

    protected $fillable = [
        'CampaignID',
        'VariantID',
        'FlashSalePrice',
        'OriginalPrice',
        'FlashSaleStock',
        'StockSold',
        'DealStartTime',
        'DealEndTime',
        'Status',
    ];

    protected $casts = [
        'DealStartTime' => 'datetime',
        'DealEndTime' => 'datetime',
    ];

    /**
     * Get the campaign that the deal belongs to.
     */
    public function campaign()
    {
        return $this->belongsTo(FlashSaleCampaign::class, 'CampaignID', 'CampaignID');
    }

    /**
     * Get the product variant associated with the deal.
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }

    /**
     * Get the order items associated with the deal.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'FlashSaleDealID', 'DealID');
    }
}
