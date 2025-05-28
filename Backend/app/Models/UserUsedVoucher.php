<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserUsedVoucher extends Model
{
    use HasFactory;

    protected $primaryKey = 'UserUsedVoucherID';

    protected $fillable = [
        'UserID',
        'VoucherID',
        'ShopOrderID',
        'TimesThisOrder',
    ];

    /**
     * Get the user who used the voucher.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the voucher that was used.
     */
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'VoucherID', 'VoucherID');
    }

    /**
     * Get the shop order where the voucher was used.
     */
    public function shopOrder()
    {
        return $this->belongsTo(ShopOrder::class, 'ShopOrderID', 'ShopOrderID');
    }
}
