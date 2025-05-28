<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon; // Import Carbon để xử lý ngày tháng

class Banner extends Model
{
    use HasFactory;

    protected $table = 'Banners'; // Tên bảng của bạn (chú ý chữ 'B' viết hoa nếu trong DB là vậy)
    protected $primaryKey = 'BannerID'; // Khóa chính

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'Title',
        'ImageURL',
        'LinkURL',
        'Position', // Đảm bảo tên cột khớp: 'Position' hoặc 'Position Index'
        'SortOrder',
        'IsActive', // Đảm bảo tên cột khớp: 'IsActive' hoặc 'IsActive Index'
        'StartDate',
        'EndDate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'IsActive' => 'boolean', // Chuyển đổi IsActive thành boolean
        'StartDate' => 'datetime', // Chuyển đổi thành đối tượng Carbon/DateTime
        'EndDate' => 'datetime',
        'SortOrder' => 'integer',
    ];

    // Nếu tên cột trong DB của bạn có khoảng trắng hoặc khác quy ước của Laravel,
    // bạn có thể cần định nghĩa accessor/mutator hoặc điều chỉnh $fillable và $casts
    // Ví dụ, nếu cột là "Position Index", bạn có thể cần map nó trong model hoặc đổi tên cột trong DB.
    // Tạm thời giả sử tên cột trong DB là 'Position' và 'IsActive'.

    /**
     * Scope a query to only include active banners based on current time and IsActive flag.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCurrentlyActive($query)
    {
        $now = Carbon::now();
        return $query->where('IsActive', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('StartDate') // Không có ngày bắt đầu (luôn active nếu IsActive=true)
                  ->orWhere('StartDate', '<=', $now); // Hoặc đã bắt đầu
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('EndDate') // Không có ngày kết thúc (luôn active nếu IsActive=true và đã bắt đầu)
                  ->orWhere('EndDate', '>=', $now); // Hoặc chưa kết thúc
            });
    }

    /**
     * Get the full image URL.
     * Nếu ImageURL trong DB là đường dẫn tương đối, bạn có thể thêm accessor này.
     *
     * @param  string  $value
     * @return string
     */
    // public function getImageURLAttribute($value)
    // {
    //     if ($value && !(str_starts_with($value, 'http://') || str_starts_with($value, 'https://'))) {
    //         return asset($value); // Hoặc url($value) hoặc config('app.url').'/'.$value
    //     }
    //     return $value;
    // }
}