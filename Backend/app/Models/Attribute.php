<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use HasFactory;

    protected $table = 'attributes'; // Tên bảng giả định
    protected $primaryKey = 'AttributeID';
    public $timestamps = false; // Giả sử

    protected $fillable = ['Name'];

    public function values()
    {
        return $this->hasMany(AttributeValue::class, 'AttributeID', 'AttributeID');
    }
}