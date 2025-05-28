<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $primaryKey = 'AddressID';

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
     * Get the user that owns the address.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    /**
     * Get the orders that use this address as the shipping address.
     */
    public function orders()
    {
        return $this->hasMany(OrderBuyer::class, 'ShippingAddressID', 'AddressID');
    }
}
