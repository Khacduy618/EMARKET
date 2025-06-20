

// // SocketServerChat/server.js
// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require("socket.io");
// const cors = require('cors');
// const mongoose = require('mongoose'); // Import mongoose ở đây để dùng ObjectId
// const axios = require('axios');

// const connectDB = require('./db');
// const Conversation = require('./models/Conversation');
// const ChatMessage = require('./models/ChatMessage');

// const app = express();
// const server = http.createServer(app);

// const LARAVEL_API_URL = process.env.LARAVEL_API_URL;
// const LARAVEL_TOKEN_VALIDATION_ENDPOINT = process.env.LARAVEL_TOKEN_VALIDATION_ENDPOINT;

// const io = new Server(server, {
//     cors: {
//         // origin: process.env.NEXTJS_FRONTEND_URL || "http://localhost:3000",
//         origin: "*",
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// });

// // Kết nối MongoDB
// connectDB();

// const onlineUsers = new Map(); // Map<mysqlUserId: number, socketId: string>

// // Middleware xác thực cho Socket.IO
// io.use(async (socket, next) => {
//     console.log(`Socket Middleware: New connection attempt. Socket ID: ${socket.id}, Handshake Auth:`, socket.handshake.auth);
//     const authToken = socket.handshake.auth.token;
//     const mysqlUserId = socket.handshake.auth.userId;
// console.log(`Socket Auth Attempt: UserID ${mysqlUserId}, Token: ${authToken ? authToken.substring(0, 20) + "..." : "No Token"}`);
//     if (!authToken || !mysqlUserId) {
//         return next(new Error('Authentication error: Token or UserID missing.'));
//     }

//     try {
//         console.log(`laravel token validation endpont: ${LARAVEL_TOKEN_VALIDATION_ENDPOINT}`);
//         console.log(`Socket Auth: Validating token for MySQL UserID: ${mysqlUserId}`);
//         const response = await axios.post(LARAVEL_TOKEN_VALIDATION_ENDPOINT, {}, {
//             headers: {
//                 'Authorization': `Bearer ${authToken}`,
//                 'Accept': 'application/json'
//             }
//         });

//         if (response.status === 200 && response.data.user && Number(response.data.user.id) === Number(mysqlUserId)) {
//             socket.mysqlUserId = Number(mysqlUserId);
//             socket.mysqlUsername = response.data.user.username; // Lưu username
//             socket.mysqlUserAvatar = response.data.user.avatar_url; // Lưu avatar
//             console.log(`Socket Auth: User ${socket.mysqlUserId} (${socket.mysqlUsername}) authenticated for socket ${socket.id}`);
//             next();
//         } else {
//             console.log('Socket Auth: Invalid token or userId mismatch from Laravel API.');
//             next(new Error('Authentication error: Invalid token from API.'));
//         }
//     } catch (error) {
//         const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
//         console.error('Socket Auth: Error validating token -', errorMessage);
//         next(new Error(`Authentication error: ${errorMessage}`));
//     }
//     //  const mysqlUserId = socket.handshake.auth.userId;
//     // if (mysqlUserId) {
//     //     socket.mysqlUserId = Number(mysqlUserId);
//     //     socket.mysqlUsername = `TestUser${mysqlUserId}`; // Giả định
//     //     socket.mysqlUserAvatar = null;
//     //     console.log(`Socket Dev Auth: User ${socket.mysqlUserId} allowed for socket ${socket.id}`);
//     //     next();
//     // } else {
//     //     console.log('Socket Dev Auth: Missing userId in handshake');
//     //     next(new Error('Authentication error: UserID missing (Dev Mode).'));
//     // }
// });


// io.on('connection', (socket) => {
    
//     const currentMysqlUserId = socket.mysqlUserId;
//     console.log(`User ${currentMysqlUserId} (${socket.mysqlUsername}) connected with socket ID: ${socket.id}`);
//     onlineUsers.set(currentMysqlUserId, socket.id);

//     socket.on('joinConversation', async ({ participantIds }) => {
//         if (!participantIds || !Array.isArray(participantIds) || participantIds.length !== 2 || !participantIds.includes(currentMysqlUserId)) {
//             return socket.emit('conversationError', { message: 'Invalid participant data for joining conversation.' });
//         }

//         const sortedParticipantIds = [...participantIds].sort((a, b) => a - b);

//         try {
//             let conversation = await Conversation.findOne({ participants: sortedParticipantIds });

//             if (!conversation) {
//                 const initialUnreadCounts = new Map();
//                 sortedParticipantIds.forEach(id => initialUnreadCounts.set(String(id), 0));
//                 conversation = new Conversation({
//                     participants: sortedParticipantIds,
//                     unreadCounts: initialUnreadCounts
//                 });
//                 await conversation.save();
//                 console.log(`New conversation created: ${conversation._id} for participants: ${sortedParticipantIds.join(', ')}`);
//             }

//             const mongoConversationIdStr = conversation._id.toString();
//             socket.join(mongoConversationIdStr);
//             console.log(`User ${currentMysqlUserId} joined room: ${mongoConversationIdStr}`);

//             const messages = await ChatMessage.find({ conversationId: conversation._id })
//                 .sort({ createdAt: 1 }) // Cũ -> Mới
//                 .limit(100) // Lấy 100 tin nhắn gần nhất
//                 .lean();

//             socket.emit('loadOldMessages', {
//                 conversationId: mongoConversationIdStr,
//                 messages: messages
//             });

//             // Đánh dấu đã đọc khi join
//             if (conversation.unreadCounts.get(String(currentMysqlUserId)) > 0) {
//                 conversation.unreadCounts.set(String(currentMysqlUserId), 0);
//                 await conversation.save();
//                 socket.emit('conversationRead', { conversationId: mongoConversationIdStr, readerId: currentMysqlUserId });
//                 // Có thể thông báo cho người kia rằng tin nhắn đã được đọc
//                 const otherParticipantId = conversation.participants.find(p => p !== currentMysqlUserId);
//                 const otherParticipantSocketId = onlineUsers.get(otherParticipantId);
//                 if(otherParticipantSocketId) {
//                     io.to(otherParticipantSocketId).emit('messagesSeen', { conversationId: mongoConversationIdStr, seenByUserId: currentMysqlUserId });
//                 }
//             }

//         } catch (error) {
//             console.error('Error in joinConversation:', error);
//             socket.emit('conversationError', { message: 'Could not process conversation.' });
//         }
//     });

//     socket.on('sendMessage', async (data, callback) => { // Thêm callback để ack
//         const { conversationId, receiverId, content, messageType } = data;
//         if (!currentMysqlUserId) {
//             if (callback) callback({ error: 'User not authenticated.' });
//             return socket.emit('sendMessageError', { message: 'User not authenticated.' });
//         }
//         if (!conversationId || !receiverId || !content) {
//             if (callback) callback({ error: 'Missing required message data.' });
//             return socket.emit('sendMessageError', { message: 'Missing required message data.' });
//         }

//         try {
//             const newMessage = new ChatMessage({
//                 conversationId: new mongoose.Types.ObjectId(conversationId),
//                 senderId: currentMysqlUserId,
//                 receiverId: Number(receiverId),
//                 content: content,
//                 messageType: messageType || 'Text',
//                 senderInfo: { // Lấy từ socket object đã được gán khi xác thực
//                     username: socket.mysqlUsername,
//                     avatarUrl: socket.mysqlUserAvatar
//                 },
//                 readBy: [currentMysqlUserId]
//             });
//             await newMessage.save();

//             const updatedConversation = await Conversation.findByIdAndUpdate(
//                 conversationId,
//                 {
//                     lastMessage: newMessage._id,
//                     lastMessageAt: newMessage.createdAt,
//                     $inc: { [`unreadCounts.${receiverId}`]: 1 }
//                 },
//                 { new: true }
//             ).populate('lastMessage'); // Populate để lấy chi tiết lastMessage nếu cần

//             const messageToSend = newMessage.toObject(); // Gửi plain object
//             io.to(conversationId.toString()).emit('newMessage', messageToSend);
//             console.log(`Message from ${currentMysqlUserId} to ${receiverId} in conv ${conversationId} broadcasted.`);

//             // Thông báo cho Laravel cập nhật metadata (nếu dùng Hybrid approach)
//             try {
//                  await axios.post(`${LARAVEL_API_URL}/internal-chat-api/update-conversation-meta`, {
//                     user_id_1: currentMysqlUserId,
//                     user_id_2: Number(receiverId),
//                     mongo_conversation_id: conversationId.toString(),
//                     last_message_content: newMessage.content.substring(0, 100), // Preview
//                     last_message_sender_id: currentMysqlUserId,
//                     last_message_at: newMessage.createdAt.toISOString(),
//                     unread_counts: Object.fromEntries(updatedConversation.unreadCounts) // Chuyển Map thành Object
//                 }, { headers: { 'X-Internal-Secret': process.env.INTERNAL_API_SECRET || 'your-secret' }}); // Thêm header bảo mật
//             } catch (metaError) {
//                  console.error("Error updating conversation meta in Laravel:", metaError.response ? metaError.response.data : metaError.message);
//             }


//             // Gửi notification cho người nhận nếu họ online và không ở trong room này
//             const receiverSocketId = onlineUsers.get(Number(receiverId));
//             if (receiverSocketId && receiverSocketId !== socket.id) {
//                 const roomSockets = io.sockets.adapter.rooms.get(conversationId.toString());
//                 if (!roomSockets || !roomSockets.has(receiverSocketId)) {
//                     io.to(receiverSocketId).emit('newNotification', {
//                         type: 'new_message',
//                         conversationId: conversationId.toString(),
//                         senderId: currentMysqlUserId,
//                         senderUsername: socket.mysqlUsername,
//                         messagePreview: content.substring(0, 30) + '...'
//                     });
//                 }
//             }

//             if (callback) callback({ success: true, message: messageToSend }); // Gửi ack thành công

//         } catch (error) {
//             console.error('Error in sendMessage:', error);
//             if (callback) callback({ error: 'Could not send message.' });
//             socket.emit('sendMessageError', { message: 'Could not send message.' });
//         }
//     });

//     socket.on('markConversationAsRead', async ({ conversationId }) => {
//         if (!currentMysqlUserId || !conversationId) return;
//         try {
//             const conversation = await Conversation.findById(conversationId);
//             if (conversation && conversation.participants.includes(currentMysqlUserId)) {
//                 const currentUserIdStr = String(currentMysqlUserId);
//                 if ((conversation.unreadCounts.get(currentUserIdStr) || 0) > 0) {
//                     conversation.unreadCounts.set(currentUserIdStr, 0);
//                     await conversation.save();

//                     // Thông báo cho Laravel cập nhật metadata
//                     try {
//                         await axios.post(`${LARAVEL_API_URL}/internal-chat-api/mark-meta-as-read`, {
//                            user_id_to_mark_read: currentMysqlUserId,
//                            mongo_conversation_id: conversationId.toString()
//                         }, { headers: { 'X-Internal-Secret': process.env.INTERNAL_API_SECRET || 'your-secret' }});
//                     } catch (metaError) {
//                         console.error("Error marking meta as read in Laravel:", metaError.response ? metaError.response.data : metaError.message);
//                     }

//                     socket.emit('conversationRead', { conversationId, readerId: currentMysqlUserId });
//                     console.log(`Conversation ${conversationId} marked as read by user ${currentMysqlUserId}`);

//                     // Thông báo cho người kia trong cuộc trò chuyện 1-1 rằng tin nhắn đã được xem
//                     const otherParticipantId = conversation.participants.find(p => p !== currentMysqlUserId);
//                     const otherParticipantSocketId = onlineUsers.get(otherParticipantId);
//                     if(otherParticipantSocketId) {
//                         io.to(otherParticipantSocketId).emit('messagesSeen', { conversationId: conversationId, seenByUserId: currentMysqlUserId });
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error marking conversation as read:', error);
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log(`User ${currentMysqlUserId} (${socket.mysqlUsername}) disconnected with socket ID: ${socket.id}`);
//         if (currentMysqlUserId) {
//             onlineUsers.delete(currentMysqlUserId);
//         }
//         // Thông báo cho các user khác về trạng thái offline (nếu cần)
//         // io.emit('userOffline', currentMysqlUserId);
//     });
// });

// const PORT = process.env.SOCKET_IO_PORT || 3002;
// server.listen(PORT, () => {
//     console.log(`Socket.IO server for chat is listening on port ${PORT}`);
// });

// SocketServerChat/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const connectDB = require('./db'); // Đảm bảo file này export hàm connectDB
const Conversation = require('./models/Conversation'); // Model Mongoose
const ChatMessage = require('./models/ChatMessage');   // Model Mongoose

const app = express();
const server = http.createServer(app);

const LARAVEL_API_URL = process.env.LARAVEL_API_URL;
const LARAVEL_TOKEN_VALIDATION_ENDPOINT = process.env.LARAVEL_TOKEN_VALIDATION_ENDPOINT;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET_KEY; // Secret để gọi API nội bộ của Laravel
const now = new Date();
const io = new Server(server, {
    cors: {
        origin: process.env.NEXTJS_FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Kết nối MongoDB
connectDB();

const onlineUsers = new Map(); // Map<mysqlUserId: number, socketId: string>

// Middleware xác thực cho Socket.IO
io.use(async (socket, next) => {
    console.log(`Socket Middleware: New connection attempt. Socket ID: ${socket.id}, Handshake Auth:`, socket.handshake.auth);
    const authToken = socket.handshake.auth.token;
    const mysqlUserId = socket.handshake.auth.userId;

    if (!authToken || !mysqlUserId) {
        console.log('Socket Auth: Missing token or userId from handshake.auth');
        return next(new Error('Authentication error: Token or UserID missing.'));
    }

    try {
        console.log(`Socket Auth: Validating token for MySQL UserID: ${mysqlUserId} via ${LARAVEL_TOKEN_VALIDATION_ENDPOINT}`);
        const response = await axios.post(LARAVEL_TOKEN_VALIDATION_ENDPOINT, {}, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 200 && response.data.user && Number(response.data.user.id) === Number(mysqlUserId)) {
            socket.mysqlUserId = Number(mysqlUserId);
            socket.mysqlUsername = response.data.user.username;
            socket.mysqlUserAvatar = response.data.user.avatar_url;
            console.log(`Socket Auth: User ${socket.mysqlUserId} (${socket.mysqlUsername}) authenticated for socket ${socket.id}`);
            next();
        } else {
            console.log('Socket Auth: Invalid token or userId mismatch from Laravel API. Response:', response.data);
            next(new Error('Authentication error: Invalid token from API.'));
        }
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Socket Auth: Error validating token with Laravel API -', errorMessage);
        next(new Error(`Authentication error: ${errorMessage}`));
    }
});

io.on('connection', (socket) => {
    const currentMysqlUserId = socket.mysqlUserId;
    if (!currentMysqlUserId) { // Kiểm tra lại sau middleware, đề phòng trường hợp next(err) không ngắt kết nối ngay
        console.error(`Socket Connection Handler: mysqlUserId is undefined for socket ${socket.id}. Disconnecting.`);
        socket.disconnect(true);
        return;
    }
    console.log(`User ${currentMysqlUserId} (${socket.mysqlUsername || 'N/A'}) connected with socket ID: ${socket.id}`);
    onlineUsers.set(currentMysqlUserId, socket.id);

    // Lắng nghe sự kiện client muốn join vào một room cụ thể bằng MongoDB Conversation ID
    socket.on('joinSpecificConversation', async (mongoConversationIdStr) => {
        if (!mongoConversationIdStr) {
            console.error(`Server: joinSpecificConversation - mongoConversationIdStr is missing for user ${currentMysqlUserId}`);
            return socket.emit('conversationError', { message: 'Conversation ID is required.' });
        }
        console.log(`Server: User ${currentMysqlUserId} attempting to join specific room: ${mongoConversationIdStr}`);

        try {
            let conversation;
            try {
                // Chuyển chuỗi ID từ client thành ObjectId của Mongoose để query
                if (!mongoose.Types.ObjectId.isValid(mongoConversationIdStr)) {
                    console.error(`Server: Invalid MongoDB ObjectId format for conversationId: ${mongoConversationIdStr}`);
                    return socket.emit('conversationError', { message: 'Invalid conversation ID format.' });
                }
                const mongoObjectId = new mongoose.Types.ObjectId(mongoConversationIdStr);
                conversation = await Conversation.findById(mongoObjectId);
            } catch (dbError) {
                console.error(`Server: Error finding conversation ${mongoConversationIdStr} in MongoDB:`, dbError);
                return socket.emit('conversationError', { message: 'Database error finding conversation.' });
            }

            if (!conversation) {
                console.log(`Server: Conversation ${mongoConversationIdStr} NOT FOUND.`);
                return socket.emit('conversationError', { message: 'Conversation not found.' });
            }

            if (!conversation.participants.includes(currentMysqlUserId)) {
                console.log(`Server: User ${currentMysqlUserId} is NOT a participant of conversation ${mongoConversationIdStr}. Access denied.`);
                return socket.emit('conversationError', { message: 'Access denied to this conversation.' });
            }

            socket.join(mongoConversationIdStr);
            console.log(`Server: User ${currentMysqlUserId} successfully joined Socket.IO room: ${mongoConversationIdStr}`);

            let messages = [];
            try {
                messages = await ChatMessage.find({ conversationId: conversation._id })
                    .sort({ createdAt: 1 })
                    .limit(100)
                    .lean();
            } catch (dbMsgError) {
                console.error(`Server: Error fetching messages for conversation ${mongoConversationIdStr}:`, dbMsgError);
                socket.emit('loadOldMessages', { conversationId: mongoConversationIdStr, messages: [] });
                return;
            }
            console.log(`Server: Found ${messages.length} messages for conversation ${mongoConversationIdStr}. Emitting 'loadOldMessages'.`);

            socket.emit('loadOldMessages', {
                conversationId: mongoConversationIdStr,
                messages: messages
            });

            // Đánh dấu đã đọc
            const currentUserIdStr = String(currentMysqlUserId);
            if (conversation.unreadCounts.get(currentUserIdStr) > 0) {
                conversation.unreadCounts.set(currentUserIdStr, 0);
                await conversation.save(); // Lưu thay đổi unreadCounts
                console.log(`Server: Marked conversation ${mongoConversationIdStr} as read for user ${currentMysqlUserId}`);
                socket.emit('conversationRead', { conversationId: mongoConversationIdStr, readerId: currentMysqlUserId });

                // Thông báo cho Laravel cập nhật metadata
                try {
                    await axios.post(`${LARAVEL_API_URL}/internal-chat-api/mark-meta-as-read`, {
                       user_id_to_mark_read: currentMysqlUserId,
                       mongo_conversation_id: mongoConversationIdStr
                    }, { headers: { 'X-Internal-Secret': INTERNAL_API_SECRET }});
                } catch (metaError) {
                    console.error("Server: Error marking meta as read in Laravel:", metaError.response ? metaError.response.data : metaError.message);
                }

                const otherParticipantId = conversation.participants.find(p => p !== currentMysqlUserId);
                if (otherParticipantId) {
                    const otherParticipantSocketId = onlineUsers.get(otherParticipantId);
                    if(otherParticipantSocketId) {
                        io.to(otherParticipantSocketId).emit('messagesSeen', { conversationId: mongoConversationIdStr, seenByUserId: currentMysqlUserId });
                    }
                }
            }
        } catch (error) {
            console.error(`Server: General error in joinSpecificConversation for ${mongoConversationIdStr}:`, error);
            socket.emit('conversationError', { message: 'Could not process joining conversation.' });
        }
    });


    socket.on('sendMessage', async (data, callback) => {
        const { conversationId, receiverId, content, messageType, senderInfo } = data;
        const currentMysqlUserId = socket.mysqlUserId;
        if (!currentMysqlUserId) {
            if (callback) callback({ error: 'User not authenticated.' });
            return socket.emit('sendMessageError', { message: 'User not authenticated.' });
        }
        if (!conversationId || !receiverId || !content) {
            if (callback) callback({ error: 'Missing required message data.' });
            return socket.emit('sendMessageError', { message: 'Missing required message data.' });
        }
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
             if (callback) callback({ error: 'Invalid conversationId format.' });
            return socket.emit('sendMessageError', { message: 'Invalid conversationId format.' });
        }

        try {
            console.log(`sendMessage: Creating new message for conv ${conversationId} from ${currentMysqlUserId} to ${receiverId}`);
            const newMessage = new ChatMessage({
                conversationId: new mongoose.Types.ObjectId(conversationId),
                senderId: currentMysqlUserId,
                receiverId: Number(receiverId),
                content: content,
                messageType: messageType || 'Text',
                senderInfo: {
                    username: socket.mysqlUsername, // Lấy từ socket đã được xác thực
                    avatarUrl: socket.mysqlUserAvatar
                },
                readBy: [currentMysqlUserId]
            });
            await newMessage.save();
                        console.log(`sendMessage: New message saved with ID: ${newMessage._id}`);
                        console.log(`sendMessage: Updating conversation ${conversationId} with last message and unread count for receiver ${receiverId}`);
            const updatedConversation = await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    lastMessage: newMessage._id,
                    lastMessageAt: now,
                    $inc: { [`unreadCounts.${receiverId}`]: 1 }
                },
                { new: true }
            ); // Không cần populate ở đây nếu không dùng ngay

            if (!updatedConversation) {
                console.error(`sendMessage Error: Conversation ${conversationId} not found for update.`);
                // Lỗi này không nên xảy ra nếu conversationId hợp lệ và đã tồn tại
                if (callback) callback({ error: 'Conversation not found during update.' });
                return socket.emit('sendMessageError', { message: 'Conversation not found during update.' });
            }
            console.log(`sendMessage: Conversation ${conversationId} updated. New unread for ${receiverId}: ${updatedConversation.unreadCounts.get(String(receiverId))}`);


            const messageToSend = newMessage.toObject();
            io.to(conversationId.toString()).emit('newMessage', messageToSend);
            console.log(`Message from ${currentMysqlUserId} to ${receiverId} in conv ${conversationId} broadcasted.`);

            // Thông báo cho Laravel cập nhật metadata
            if (updatedConversation && newMessage) { // Đảm bảo conversation được tìm thấy và cập nhật
                
                try {
                     console.log(`Server: Attempting to update metadata in Laravel for convo: ${conversationId}`);
                     const metaPayload = {
                        user_id_1: currentMysqlUserId, // Người gửi
                        user_id_2: Number(receiverId),   // Người nhận
                        mongo_conversation_id: conversationId.toString(),
                        last_message_content: newMessage.content.substring(0, 250), // Lấy preview, giới hạn độ dài
                        last_message_sender_id: currentMysqlUserId, // ID của người vừa gửi
                        last_message_at: newMessage.createdAt.toISOString(), // Gửi dạng ISO string
                        // unreadCounts cần được lấy từ updatedConversation và gửi đúng
                        // updatedConversation.unreadCounts là một Map, cần chuyển thành object
                        unread_counts: Object.fromEntries(updatedConversation.unreadCounts)
                    };
                    console.log("Server: Payload for Laravel meta update:", metaPayload);
console.log(`Server: Attempting to update metadata in Laravel for convo: ${conversationId}. Secret Key to be used: ${INTERNAL_API_SECRET ? 'Exists and has a value' : 'MISSING or empty'}`);
                     await axios.post(`${LARAVEL_API_URL}/internal-chat-api/update-conversation-meta`, metaPayload,
                     {
                        headers: {
                            'X-Internal-Secret': INTERNAL_API_SECRET,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log(`Server: Successfully updated conversation meta in Laravel for convo: ${conversationId}`);
                } catch (metaError) {
                     console.error("Server: Error updating conversation meta in Laravel:", metaError.response ? metaError.response.data : metaError.message);
                      console.error(`Server: Error updating conversation meta in Laravel for convo ${conversationId}:`, errorDetail);
                      if (metaError.config && metaError.config.headers) {
                     console.error("Axios request headers ACTUALLY SENT to Laravel (for update-conversation-meta):", metaError.config.headers); // LOG HEADER THỰC SỰ GỬI ĐI KHI CÓ LỖI
                     }

                     // ... trong catch (metaError) ...
if (metaError.isAxiosError) {
    console.error("Axios Error Details for meta update:");
    if (metaError.response) {
        // Request được thực hiện và server trả về status code không phải 2xx
        console.error("Data:", metaError.response.data);
        console.error("Status:", metaError.response.status);
        console.error("Headers:", metaError.response.headers);
    } else if (metaError.request) {
        // Request đã được thực hiện nhưng không nhận được response
        console.error("Request:", metaError.request);
    } else {
        // Lỗi xảy ra khi thiết lập request
        console.error("Error Message:", metaError.message);
    }
    console.error("Config:", metaError.config);
} else {
    // Lỗi khác không phải của axios
    console.error("Non-Axios Error during meta update:", metaError.message);
}
                }
            }

            const receiverSocketId = onlineUsers.get(Number(receiverId));
            if (receiverSocketId && receiverSocketId !== socket.id) {
                const roomSockets = io.sockets.adapter.rooms.get(conversationId.toString());
                if (!roomSockets || !roomSockets.has(receiverSocketId)) {
                    io.to(receiverSocketId).emit('newNotification', {
                        type: 'new_message',
                        conversationId: conversationId.toString(),
                        senderId: currentMysqlUserId,
                        senderUsername: socket.mysqlUsername,
                        messagePreview: content.substring(0, 30) + '...'
                    });
                }
            }

            if (callback) callback({ success: true, message: messageToSend });

        } catch (error) {
            console.error('Error in sendMessage:', error);
            if (callback) callback({ error: 'Could not send message.' });
            socket.emit('sendMessageError', { message: 'Could not send message.' });
        }
    });

    socket.on('markConversationAsRead', async ({ conversationId }) => {
        // Logic như đã cung cấp ở câu trả lời trước, đảm bảo gọi API Laravel
        if (!currentMysqlUserId || !conversationId) return;
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            console.error(`Server: Invalid ObjectId for markConversationAsRead: ${conversationId}`);
            return;
        }
        try {
            const conversation = await Conversation.findById(conversationId);
            if (conversation && conversation.participants.includes(currentMysqlUserId)) {
                const currentUserIdStr = String(currentMysqlUserId);
                if ((conversation.unreadCounts.get(currentUserIdStr) || 0) > 0) {
                    conversation.unreadCounts.set(currentUserIdStr, 0);
                    await conversation.save();
                    try {
                        console.log(`Server: Attempting to mark meta as read in Laravel for convo: ${conversationId}. Secret Key to be used: ${INTERNAL_API_SECRET ? 'Exists and has a value' : 'MISSING or empty'}`); // THÊM LOG NÀY
                        await axios.post(`${LARAVEL_API_URL}/internal-chat-api/mark-meta-as-read`, {
                           user_id_to_mark_read: currentMysqlUserId,
                           mongo_conversation_id: conversationId.toString()
                        }, {
                            headers: {
                                'X-Internal-Secret': INTERNAL_API_SECRET, // <<< ĐẢM BẢO BIẾN NÀY CÓ GIÁ TRỊ
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                         console.log(`Server: Successfully marked meta as read in Laravel for convo: ${conversationId}`);
                    } catch (metaError) {
                        console.error("Server: Error marking meta as read in Laravel:", metaError.response ? metaError.response.data : metaError.message);
                    }

                    socket.emit('conversationRead', { conversationId, readerId: currentMysqlUserId });
                    const otherParticipantId = conversation.participants.find(p => p !== currentMysqlUserId);
                    if (otherParticipantId) {
                        const otherParticipantSocketId = onlineUsers.get(otherParticipantId);
                        if(otherParticipantSocketId) {
                            io.to(otherParticipantSocketId).emit('messagesSeen', { conversationId: conversationId, seenByUserId: currentMysqlUserId });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    });

    socket.on('leaveConversation', (mongoConversationIdStr) => {
        if (mongoConversationIdStr) {
            socket.leave(mongoConversationIdStr);
            console.log(`User ${currentMysqlUserId} left room: ${mongoConversationIdStr}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${currentMysqlUserId} (${socket.mysqlUsername || 'N/A'}) disconnected with socket ID: ${socket.id}`);
        if (currentMysqlUserId) {
            onlineUsers.delete(currentMysqlUserId);
        }
    });
});

const PORT = process.env.SOCKET_IO_PORT || 3002;
server.listen(PORT, () => {
    console.log(`Socket.IO server for chat is listening on port ${PORT}`);
});