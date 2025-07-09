// SocketServerChat/models/ChatMessage.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
    conversationId: { // _id của Conversation trong MongoDB
        type: Schema.Types.ObjectId,
        ref: 'Conversation', // Tham chiếu đến model Conversation
        required: true,
        index: true, // Index để truy vấn tin nhắn theo conversation nhanh
    },
    senderId: { // UserID từ CSDL MySQL của Laravel (người gửi)
        type: Number,
        required: true,
        index: true,
    },
    receiverId: { // UserID từ CSDL MySQL của Laravel (người nhận - cho chat 1-1)
                  // Đối với group chat, trường này có thể không cần thiết hoặc
                  // có thể là một mảng các receiverIds nếu tin nhắn chỉ gửi cho một số người trong group.
                  // Trong ngữ cảnh hiện tại (chat người mua - người bán), đây là ID của người còn lại.
        type: Number,
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    messageType: {
        type: String,
        enum: ['Text', 'Image', 'ProductLink', 'OrderLink'], // Thêm các loại tin nhắn nếu cần
        default: 'Text',
    },
    // Thông tin bổ sung cho các loại tin nhắn đặc biệt
    // Ví dụ, nếu messageType là 'ProductLink' hoặc 'OrderLink'
    linkInfo: {
        type: { type: String }, // 'product', 'order'
        id: String, // ProductID hoặc OrderCode
        name: String, // Tên sản phẩm hoặc mô tả ngắn đơn hàng
        imageUrl: String, // Ảnh sản phẩm
        price: String, // Giá sản phẩm (nếu là link sản phẩm)
    },
    // Quản lý trạng thái đã đọc.
    // Cách 1: Cho chat 1-1, chỉ cần isRead cho receiver.
    // isReadByReceiver: { type: Boolean, default: false },
    // readAt: { type: Date },

    // Cách 2: Cho cả group chat, lưu danh sách người đã đọc.
    readBy: [{ // Mảng các UserID (MySQL) đã đọc tin nhắn này
        type: Number,
    }],
    // Thông tin người gửi được snapshot lại để giảm query khi lấy lịch sử chat
    // Điều này là denormalization, cân nhắc nếu thông tin user (username, avatar) thay đổi thường xuyên
    // thì có thể cần cơ chế cập nhật hoặc chỉ lấy ID rồi query khi hiển thị.
    senderInfo: {
        username: { type: String, required: false },
        avatarUrl: { type: String, required: false },
    },
    // createdAt và updatedAt sẽ được Mongoose tự động quản lý nhờ {timestamps: true}
}, {
    timestamps: true
});

// Index cho việc sắp xếp tin nhắn theo thời gian
chatMessageSchema.index({ conversationId: 1, createdAt: -1 }); // Lấy tin nhắn mới nhất
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });  // Lấy tin nhắn cũ nhất

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;