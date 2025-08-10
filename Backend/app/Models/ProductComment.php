<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductComment extends Model
{
    use HasFactory;

    protected $table = 'productcomment';
    protected $primaryKey = 'CommentID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $casts = [
        'likes' => 'array',
        'dislikes' => 'array',
    ];

    protected $fillable = [
        'ProductID',
        'UserID',
        'ParentCommentID',
        'Comment',
        'IsApproved',
        'likes',
        'dislikes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ProductComment::class, 'ParentCommentID', 'CommentID');
    }
}