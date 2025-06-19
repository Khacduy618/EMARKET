<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'AttributeID';

    protected $fillable = [
        // Add fillable fields here if needed
        // e.g., 'name', 'type', etc.
    ];

    /**
     * Get the attribute values for the attribute.
     */
    public function attributeValues()
    {
        return $this->hasMany(AttributeValue::class, 'AttributeID', 'AttributeID');
    }
}
