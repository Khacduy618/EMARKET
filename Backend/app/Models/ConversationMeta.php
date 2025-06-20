<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationMeta extends Model
{
    use HasFactory;

    protected $table = 'user_chat_conversations_meta';

    // Laravel sẽ tự quản lý created_at và updated_at nếu tên cột là vậy.
    // Nếu bạn đặt tên khác (ví dụ: created_at_mysql), bạn cần khai báo:
    const CREATED_AT = 'created_at_mysql';
    const UPDATED_AT = 'updated_at_mysql';

    protected $fillable = [
        'user_id',
        'mongo_conversation_id',
        'other_user_id',
        'other_user_username',
        'other_user_avatar',
        'last_message_preview',
        'last_message_at_mysql',
        'unread_count_mysql',
    ];

    protected $casts = [
        'last_message_at_mysql' => 'datetime',
        'unread_count_mysql' => 'integer',
    ];

    /**
     * Lấy thông tin người dùng sở hữu metadata này.
     */
    public function owner() // Hoặc user()
    {
        return $this->belongsTo(User::class, 'user_id', 'UserID'); // Khớp UserID với bảng users
    }

    /**
     * Lấy thông tin người dùng đang chat cùng.
     */
    public function otherUser()
    {
        return $this->belongsTo(User::class, 'other_user_id', 'UserID'); // Khớp UserID với bảng users
    }
    
}