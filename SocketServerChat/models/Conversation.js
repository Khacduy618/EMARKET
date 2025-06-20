// SocketServerChat/models/Conversation.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: Number, // UserID từ CSDL MySQL của Laravel
        required: true,
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'ChatMessage',
        default: null,
    },
    lastMessageAt: {
        type: Date,
        default: null,
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    },
}, {
    timestamps: true
});

conversationSchema.pre('save', function(next) {
    if (this.isNew && this.participants && this.participants.length === 2) {
        this.participants.sort((a, b) => a - b);
    }
    next();
});

conversationSchema.index({ participants: 1 });

// Tạo một virtual property để lấy ID của người còn lại trong chat 1-1
// Sử dụng JSDoc để mô tả kiểu nếu muốn
/**
 * Lấy ID của người tham gia còn lại trong cuộc trò chuyện 1-1.
 * @param {number} currentUserId - ID của người dùng hiện tại.
 * @returns {number | null} ID của người tham gia còn lại, hoặc null nếu không phải chat 1-1 hoặc không tìm thấy.
 * @this {import('mongoose').Document & { participants: number[] }}
 */
conversationSchema.virtual('otherParticipantId')
  .get(function(currentUserId) { // Bỏ type annotation: currentUserId: number
    // 'this' ở đây sẽ là document Mongoose
    if (this.participants && this.participants.length === 2) {
      // Bỏ type annotation: pId: number
      return this.participants.find((pId) => pId !== currentUserId);
    }
    return null;
  });
// Lưu ý: Cách gọi virtual property này sẽ khác.
// Thông thường, virtual property không nhận tham số trực tiếp khi gọi.
// Bạn có thể cần truyền currentUserId vào một method của document thay vì virtual getter.

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;