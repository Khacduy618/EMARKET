<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\FlashSaleDeal;

class FlashSaleCampaign extends Model
{
    use HasFactory;

    protected $primaryKey = 'CampaignID';

    protected $fillable = [
        'AdminUserID',
        'CampaignName',
        'StartTime',
        'EndTime',
        'Status',
    ];

    protected $casts = [
        'StartTime' => 'datetime',
        'EndTime' => 'datetime',
    ];

    /**
     * Get the admin user who created the campaign.
     */
    public function adminUser()
    {
        return $this->belongsTo(User::class, 'AdminUserID', 'UserID');
    }

    /**
     * Get the flash sale deals for the campaign.
     */
    public function flashSaleDeals()
    {
        return $this->hasMany(FlashSaleDeal::class, 'CampaignID', 'CampaignID');
    }
}
