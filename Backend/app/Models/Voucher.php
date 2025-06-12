<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Shop;
use App\Models\User;
use App\Models\UserVoucher;

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
        'CreatedBy', // Added CreatedBy
        'UserID', // Added UserID (creator)
    ];

    protected $casts = [
        'StartDate' => 'datetime',
        'EndDate' => 'datetime',
        'DiscountType' => 'string', // Cast enums to string
        'Scope' => 'string',
        'CreatedBy' => 'string',
    ];

    /**
     * Get the shop that the voucher belongs to (if it's a shop voucher).
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the user who created the voucher.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the user used vouchers for this voucher.
     */
    public function userUsedVouchers(): HasMany
    {
        return $this->hasMany(UserVoucher::class, 'VoucherID', 'VoucherID');
    }
}
