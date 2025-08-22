<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Shop;
use App\Models\OrderBuyer;
use App\Models\ProductReview;
use App\Models\ShopFollow;
use App\Models\Voucher;
use App\Models\UserVoucher;
use Laravel\Sanctum\HasApiTokens;



use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens, TwoFactorAuthenticatable ;

    protected $table = 'Users';
    protected $primaryKey = 'UserID';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = false;


    protected $appends = [
        'two_factor_enabled',
    ];

    // Override timestamp names:
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    public const ROLES = ['Buyer', 'Seller', 'Admin'];
    public const LEVELS = ['Đồng', 'Bạc', 'Vàng', 'Bạch kim', 'Kim cương'];

    // Đảm bảo dùng đúng cột Password để auth
    public function getAuthPassword()
    {
        return $this->Password;
    }

    // Laravel Fortify gửi email xác nhận đến cột Email
    public function getEmailForVerification()
    {
        return $this->Email;
    }

    // public function sendEmailVerificationNotification()
    // {
    //     $this->notify(new VerifyEmail());
    // }

    public function routeNotificationForMail($notification)
    {
        return $this->Email;
    }

    public function getEmailForPasswordReset(): string
    {
        // Trả về giá trị từ cột 'Email' (chữ E viết hoa) của bạn
        return $this->Email;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    // Normalize email: lowercase để login không bị sai
    public function setEmailAttribute($value)
    {
        $this->attributes['Email'] = strtolower($value);
    }

    public function getEmailAttribute($value)
    {
        return strtolower($value);
    }

    protected function twoFactorEnabled(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return new \Illuminate\Database\Eloquent\Casts\Attribute(
            get: fn () => ! empty($this->two_factor_secret) && ! empty($this->two_factor_confirmed_at),
        );
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'Username',
        'Email',
        'Password',
        'Avatar',
        'FullName',
        'Phone',
        'Level',
        'Role',
        'IsActive',
        'Token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'Password',
        'remember_token',
        'Token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', // Keep if email verification is used
            // 'Password' => 'hashed',
            'IsActive' => 'boolean',
            'Level' => 'string', // Cast enums to string
            'Role' => 'string',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the addresses for the user.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class, 'UserID', 'UserID');
    }

    /**
     * Get the default address for the user.
     */
    public function defaultAddress(): HasOne
    {
        return $this->hasOne(Address::class, 'UserID', 'UserID')->where('IsDefault', true);
    }

    /**
     * Get the cart for the user.
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class, 'UserID', 'UserID');
    }

    /**
     * Get the shops owned by the user.
     */
    public function shop(): HasOne
{
    return $this->hasOne(Shop::class, 'UserID', 'UserID');
}

    /**
     * Get the orders placed by the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(OrderBuyer::class, 'UserID', 'UserID');
    }

    /**
     * Get the product reviews created by the user.
     */
    public function productReviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'UserID', 'UserID');
    }

    /**
     * Get the shops followed by the user.
     */
    public function shopFollows(): HasMany
    {
        return $this->hasMany(ShopFollow::class, 'UserID', 'UserID');
    }

    /**
     * Get the vouchers created by the user (if Role is Admin or Seller).
     */
    public function createdVouchers(): HasMany
    {
        return $this->hasMany(Voucher::class, 'UserID', 'UserID');
    }

    /**
     * Get the vouchers used by the user.
     */
    public function usedVouchers(): HasMany
    {
        return $this->hasMany(UserVoucher::class, 'UserID', 'UserID');
    }


    public function conversationMetas()
    {
        return $this->hasMany(ConversationMeta::class, 'user_id', 'UserID');
    }
}
