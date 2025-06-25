<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ConversationMeta;
use App\Models\User; // Import model User
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator; // Để validate request
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Lấy danh sách metadata các cuộc trò chuyện của người dùng hiện tại.
     */
    public function getMyConversations(Request $request)
    {
        $user =  Auth::user();
        Log::info('id user: ' . $user->UserID);
       
        $conversationsMeta = ConversationMeta::where('user_id', $user->UserID) // Sử dụng UserID của user hiện tại
                                           ->with(['otherUser:UserID,Username,Avatar']) // Chỉ lấy các cột cần thiết của otherUser
                                           ->orderBy('last_message_at_mysql', 'desc')
                                           ->get()
                                           ->map(function ($meta) { // Format lại nếu cần
                                                return [
                                                    'mongo_conversation_id' => $meta->mongo_conversation_id,
                                                    'other_user_id' => $meta->other_user_id,
                                                    'other_user_username' => $meta->otherUser ? $meta->otherUser->Username : $meta->other_user_username,
                                                    'other_user_avatar' => $meta->otherUser ? $meta->otherUser->avatar_url : $meta->other_user_avatar,
                                                    'last_message_preview' => $meta->last_message_preview,
                                                    'last_message_at_mysql' => $meta->last_message_at_mysql ? $meta->last_message_at_mysql->toIso8601String() : null,
                                                    'unread_count_mysql' => $meta->unread_count_mysql,
                                                    'updated_at_mysql' => $meta->updated_at_mysql->toIso8601String(),
                                                ];
                                           });

        return response()->json(['conversations' => $conversationsMeta]);
    }

    /**
     * API để Socket.IO server cập nhật/tạo metadata cuộc trò chuyện.
     * Endpoint này cần được bảo vệ (ví dụ: chỉ cho phép gọi từ IP của Socket.IO server, hoặc dùng một secret key riêng).
     * Hoặc, Socket.IO server gọi API này với một token đặc biệt của hệ thống.
     * Hiện tại, tôi sẽ không thêm middleware bảo vệ đặc biệt cho endpoint này, bạn cần tự cân nhắc.
     */
    // public function updateConversationMeta(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'user_id_1' => 'required|integer|exists:users,UserID', // Participant 1
    //         'user_id_2' => 'required|integer|exists:users,UserID|different:user_id_1', // Participant 2
    //         'mongo_conversation_id' => 'required|string|max:24',
    //         'last_message_content' => 'nullable|string|max:255',
    //         'last_message_sender_id' => 'nullable|integer|exists:users,UserID', // Ai đã gửi tin nhắn cuối
    //         'last_message_at' => 'required|date_format:Y-m-d H:i:sP', // Format ISO 8601 từ JS new Date().toISOString() hoặc tương tự
    //         'unread_counts' => 'required|array', // Ví dụ: {"1": 0, "2": 5} (key là UserID, value là count)
    //         'unread_counts.*' => 'integer|min:0' // Validate từng giá trị trong unread_counts
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     $data = $validator->validated();
    //     $user1 = User::find($data['user_id_1']);
    //     $user2 = User::find($data['user_id_2']);

    //     if (!$user1 || !$user2) {
    //         return response()->json(['error' => 'One or more users not found.'], 404);
    //     }

    //     $timestampFromSocket = \Carbon\Carbon::parse($data['last_message_at'])->setTimezone(config('app.timezone'));

    //     // Cập nhật/Tạo metadata cho user_id_1
    //     ConversationMeta::updateOrCreate(
    //         ['user_id' => $data['user_id_1'], 'mongo_conversation_id' => $data['mongo_conversation_id']],
    //         [
    //             'other_user_id' => $data['user_id_2'],
    //             'other_user_username' => $user2->Username, // Lấy thông tin mới nhất
    //             'other_user_avatar' => $user2->avatar_url, // Thêm cột này vào User model/table
    //             'last_message_preview' => $data['last_message_content'],
    //             'last_message_at_mysql' => $timestampFromSocket,
    //             'unread_count_mysql' => $data['unread_counts'][(string)$data['user_id_1']] ?? 0,
    //         ]
    //     );

    //     // Cập nhật/Tạo metadata cho user_id_2
    //     ConversationMeta::updateOrCreate(
    //         ['user_id' => $data['user_id_2'], 'mongo_conversation_id' => $data['mongo_conversation_id']],
    //         [
    //             'other_user_id' => $data['user_id_1'],
    //             'other_user_username' => $user1->Username,
    //             'other_user_avatar' => $user1->avatar_url,
    //             'last_message_preview' => $data['last_message_content'],
    //             'last_message_at_mysql' => $timestampFromSocket,
    //             'unread_count_mysql' => $data['unread_counts'][(string)$data['user_id_2']] ?? 0,
    //         ]
    //     );

    //     return response()->json(['status' => 'success', 'message' => 'Conversation metadata updated.']);
    // }


    // Backend/app/Http/Controllers/Api/ChatController.php
public function updateConversationMeta(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id_1' => 'required|integer|exists:Users,UserID', // Ai cũng được, miễn là 1 trong 2 participants
        'user_id_2' => 'required|integer|exists:Users,UserID|different:user_id_1', // Người còn lại
        'mongo_conversation_id' => 'required|string|max:24',
        'last_message_content' => 'nullable|string|max:255', // Max length của cột last_message_preview
        'last_message_sender_id' => 'nullable|integer|exists:Users,UserID',
        'last_message_at' => 'required|date|after_or_equal:2024-01-01T00:00:00Z', // ISO8601 UTC
        'unread_counts' => 'required|array',
        'unread_counts.*' => 'integer|min:0'
    ]);

    if ($validator->fails()) {
        Log::error('[ChatMetaUpdate] Validation failed:', $validator->errors()->toArray());
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $data = $validator->validated();
    $user1 = User::find($data['user_id_1']); // Người tham gia 1
    $user2 = User::find($data['user_id_2']); // Người tham gia 2

    if (!$user1 || !$user2) {
        Log::error('[ChatMetaUpdate] One or both users not found.', ['user1_id' => $data['user_id_1'], 'user2_id' => $data['user_id_2']]);
        return response()->json(['error' => 'One or more users not found.'], 404);
    }

    // Chuyển đổi timestamp từ ISO8601 (UTC) mà JS gửi sang, thành đối tượng Carbon và lưu vào DB (DB sẽ tự xử lý múi giờ nếu cột là TIMESTAMP)
    try {
        // Carbon::parse sẽ linh hoạt hơn trong việc đọc các định dạng ISO 8601
        $timestampFromSocket = \Carbon\Carbon::parse($data['last_message_at'])->setTimezone(config('app.timezone'));
    } catch (\Exception $e) {
        Log::error('[ChatMetaUpdate] Invalid date format for last_message_at:', ['date_string' => $data['last_message_at'], 'error' => $e->getMessage()]);
        return response()->json(['error' => 'Invalid date format for last_message_at.'], 422);
    }


    Log::info('[ChatMetaUpdate] Updating metadata for conversation:', [
        'mongo_id' => $data['mongo_conversation_id'],
        'user1' => $user1->UserID,
        'user2' => $user2->UserID,
        'preview' => $data['last_message_content'],
        'time' => $timestampFromSocket->toDateTimeString(),
        'unread_counts_received' => $data['unread_counts']
    ]);

    // Cập nhật/Tạo metadata cho user1 (người tham gia 1)
    ConversationMeta::updateOrCreate(
        ['user_id' => $user1->UserID, 'mongo_conversation_id' => $data['mongo_conversation_id']],
        [
            'other_user_id' => $user2->UserID,
            'other_user_username' => $user2->Username,
            'other_user_avatar' => $user2->avatar_url, // Đảm bảo cột avatar_url tồn tại trong model User
            'last_message_preview' => $data['last_message_content'],
            'last_message_at_mysql' => $timestampFromSocket,
            'unread_count_mysql' => $data['unread_counts'][(string)$user1->UserID] ?? 0, // Lấy unread count cho user1
        ]
    );

    // Cập nhật/Tạo metadata cho user2 (người tham gia 2)
    ConversationMeta::updateOrCreate(
        ['user_id' => $user2->UserID, 'mongo_conversation_id' => $data['mongo_conversation_id']],
        [
            'other_user_id' => $user1->UserID,
            'other_user_username' => $user1->Username,
            'other_user_avatar' => $user1->avatar_url,
            'last_message_preview' => $data['last_message_content'],
            'last_message_at_mysql' => $timestampFromSocket,
            'unread_count_mysql' => $data['unread_counts'][(string)$user2->UserID] ?? 0, // Lấy unread count cho user2
        ]
    );

    Log::info('[ChatMetaUpdate] Metadata update successful for conversation:', ['mongo_id' => $data['mongo_conversation_id']]);
    return response()->json(['status' => 'success', 'message' => 'Conversation metadata updated.']);
    }


     /**
     * API để Socket.IO server đánh dấu đã đọc cho user cụ thể (cập nhật metadata)
     */
    public function markMetaAsRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id_to_mark_read' => 'required|integer|exists:Users,UserID',
            'mongo_conversation_id' => 'required|string|max:24',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $data = $validator->validated();

        $meta = ConversationMeta::where('user_id', $data['user_id_to_mark_read'])
                                ->where('mongo_conversation_id', $data['mongo_conversation_id'])
                                ->first();
        if ($meta) {
            $meta->unread_count_mysql = 0;
            $meta->save();
            return response()->json(['status' => 'success', 'message' => 'Metadata marked as read.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Metadata not found.'], 404);
    }
}