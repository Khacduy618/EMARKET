<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryAttribute extends Model
{
  use HasFactory;

  protected $table = 'categoryattribute';
  protected $primaryKey = 'CategoryAttributeID';
  public $incrementing = true;
  protected $keyType = 'int';
  public $timestamps = false;
  public const CREATED_AT = 'CreatedAt';
  public const UPDATED_AT = 'UpdatedAt';

  protected $fillable = [
    'CategoryID',
    'AttributeID',
  ];

  public function category()
  {
    return $this->belongsTo(PlatformCategory::class, 'CategoryID', 'CategoryID');
  }

  public function attribute()
  {
    return $this->belongsTo(Attribute::class, 'AttributeID', 'AttributeID');
  }
}
