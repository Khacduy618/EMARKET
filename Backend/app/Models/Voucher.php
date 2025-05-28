<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $primaryKey = 'VoucherID';

    protected $fillable = [
        'Code',
        'Description',
        'DiscountType',
        'DiscountValue',
        'MaxValueForPercentage',
        'MinOrderValue',
        'StartDate',
        'EndDate',
        'UsageLimitPerUser',
        'UsageLimitTotal',
        'TimesUsed',
        'Scope',
        'ShopID',
        'IsActive',
    ];

    protected $casts = [
        'StartDate' => 'datetime',
        'EndDate' => 'datetime',
    ];

    /**
     * Get the shop that the voucher belongs to (if it's a shop voucher).
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the user used vouchers for this voucher.
     */
    public function userUsedVouchers()
    {
        return $this->hasMany(UserUsedVoucher::class, 'VoucherID', 'VoucherID');
    }
}
