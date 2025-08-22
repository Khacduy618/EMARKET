<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use HasFactory;
    protected $table = "Attributes";
    protected $primaryKey = 'AttributeID';
    public $timestamps = false;
    protected $fillable = [
        'AttributeID',
        'Name'
    ];

    /**
     * Get the attribute values for the attribute.
     */
    public function attributeValues()
    {
        return $this->hasMany(AttributeValue::class, 'AttributeID', 'AttributeID');
    }
}
