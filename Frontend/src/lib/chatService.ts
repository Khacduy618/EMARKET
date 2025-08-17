// app/lib/chatService.ts
import { adminDb } from '@/lib/firebase/admin';

// Hàm này chứa toàn bộ logic lấy conversations từ Firestore
export async function getConversationsForUser(userId: string) {
    try {
        const conversationsSnapshot = await adminDb
            .collection('conversations')
            .where('participants', 'array-contains', userId)
            .get();

        if (conversationsSnapshot.empty) {
            return [];
        }

        const conversationsData = await Promise.all(
            conversationsSnapshot.docs.map(async (doc) => {
                const conversation = doc.data();
                const otherUserId = conversation.participants.find((pId: string) => pId !== userId);

                if (!otherUserId) return null;

                const userDoc = await adminDb.collection('users').doc(otherUserId).get();
                const otherUserInfo = userDoc.exists ? userDoc.data() : { name: 'Người dùng không xác định' };

                const lastMessageSnapshot = await adminDb
                    .collection('conversations')
                    .doc(doc.id)
                    .collection('messages')
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get();

                const lastMessage = lastMessageSnapshot.docs[0]?.data();

                return {
                    id: otherUserId,
                    name: otherUserInfo?.name || 'Unknown User',
                    avatar: otherUserInfo?.image || null,
                    lastMessage: {
                        text: lastMessage?.text || 'Bắt đầu cuộc trò chuyện',
                    },
                };
            })
        );

        return conversationsData.filter(Boolean);

    } catch (error) {
        console.error("Error in getConversationsForUser:", error);
        // Ném lỗi ra để nơi gọi có thể xử lý
        throw new Error("Could not fetch conversations.");
    }
}