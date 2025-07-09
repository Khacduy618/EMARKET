<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Voucher;
use App\Models\Shop;
use App\Models\OrderBuyer;

class UserVoucher extends Model
{
    use HasFactory;
    protected $table = 'UserVouchers';
    protected $primaryKey = 'UserVoucherID'; // Changed from UserUsedVoucherID

    protected $fillable = [
        'UserID',
        'VoucherID',
        'ShopID', // Added ShopID
        'OrderID', // Changed from ShopOrderID
        'TimesUsedThisOrder', // Changed from TimesThisOrder
    ];

    protected $casts = [
        // Add casts if needed
    ];

    /**
     * Get the user who used the voucher.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the voucher that was used.
     */
    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class, 'VoucherID', 'VoucherID');
    }

    /**
     * Get the shop associated with the used voucher (if it's a shop voucher).
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'ShopID', 'ShopID');
    }

    /**
     * Get the order where the voucher was used.
     */
    public function order(): BelongsTo // Changed from shopOrder
    {
        return $this->belongsTo(OrderBuyer::class, 'OrderID', 'OrderID');
    }

    // Removed shopOrder relationship as it's not in the schema
}
