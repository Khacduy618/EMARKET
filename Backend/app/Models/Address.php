<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Address extends Model
{
    use HasFactory;
    protected $table = 'Addresses';
    protected $primaryKey = 'AddressID';

    /**
     * Tên của các cột timestamp.
     * Bảo Laravel sử dụng 'CreatedAt' và 'UpdatedAt'.
     */
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';


    /**
     * The attributes that are mass assignable.
     * (Giữ nguyên)
     */
    protected $fillable = [
        'UserID',
        'FullName',
        'PhoneNumber',
        'Street',
        'Ward',
        'District',
        'City',
        'IsDefault',
    ];

    /**
     * Cast thuộc tính IsDefault thành kiểu boolean.
     */
    protected $casts = [
        'IsDefault' => 'boolean'
    ];


    /**
     * Get the user that owns the address.
     * (Giữ nguyên)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the orders that use this address as the shipping address.
     * (Giữ nguyên)
     */
    public function orders()
    {
        return $this->hasMany(OrderBuyer::class, 'ShippingAddressID', 'AddressID');
    }

    /**
     * Get the addresses for the user.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class, 'UserID', 'UserID');
    }
}
