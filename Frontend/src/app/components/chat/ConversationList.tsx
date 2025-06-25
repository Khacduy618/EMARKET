// Frontend/components/chat/ConversationList.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image'; // Sử dụng Next.js Image component

export interface ConversationMeta {
  mongo_conversation_id: string;
  other_user_id: number;
  other_user_username: string;
  other_user_avatar?: string | null;
  last_message_preview?: string | null;
  last_message_at_mysql?: string | null;
  unread_count_mysql: number;
}

interface ConversationListProps {
  authToken: string | null;
  currentUserId: number | null;
  onSelectConversation: (
    otherUserId: number,
    mongoConversationId: string,
    otherUserName: string,
    otherUserAvatar?: string | null
  ) => void;
  socket?: any;
  activeConversationId?: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  authToken,
  currentUserId,
  onSelectConversation,
  socket,
  activeConversationId
}) => {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!authToken || !currentUserId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/my-conversations`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.conversations) {
          // Sắp xếp theo tin nhắn mới nhất
          const sortedConversations = [...data.conversations].sort((a, b) =>
            new Date(b.last_message_at_mysql || 0).getTime() - new Date(a.last_message_at_mysql || 0).getTime()
          );
          setConversations(sortedConversations);
        } else {
          setConversations([]);
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error);
        setError(`Không thể tải danh sách trò chuyện: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Lắng nghe cập nhật real-time cho danh sách cuộc trò chuyện từ Socket.IO server
    const handleConversationUpdate = (updatedMeta: ConversationMeta | { conversationId: string, unreadCount: number, userId: number }) => {
      console.log("Received conversationListUpdated or unreadCountUpdate:", updatedMeta);
      setConversations(prevConvs => {
        let newConvs = [...prevConvs];
        // @ts-ignore
        const mongoIdToUpdate = updatedMeta.mongo_conversation_id || updatedMeta.conversationId;

        const index = newConvs.findIndex(c => c.mongo_conversation_id === mongoIdToUpdate);

        if ('unreadCount' in updatedMeta && 'userId' in updatedMeta && Number(updatedMeta.userId) === currentUserId) {
          // Cập nhật unread count
          if (index > -1) {
            newConvs[index] = { ...newConvs[index], unread_count_mysql: updatedMeta.unreadCount };
          }
        } else if ('mongo_conversation_id' in updatedMeta) {
          // Cập nhật toàn bộ metadata (khi có tin nhắn mới)
          if (index > -1) {
            newConvs[index] = updatedMeta as ConversationMeta;
          } else {
            newConvs.unshift(updatedMeta as ConversationMeta); // Thêm vào đầu danh sách
          }
        }
        // Sắp xếp lại sau khi cập nhật hoặc thêm mới
        return newConvs.sort((a, b) =>
            new Date(b.last_message_at_mysql || 0).getTime() - new Date(a.last_message_at_mysql || 0).getTime()
        );
      });
    };

    if (socket) {
      socket.on('conversationListUpdated', handleConversationUpdate); // Server nên emit cái này khi có tin nhắn mới và metadata được cập nhật
      socket.on('unreadCountUpdate', handleConversationUpdate); // Server emit khi unread count thay đổi (sau khi markAsRead)
    }

    return () => {
      if (socket) {
        socket.off('conversationListUpdated', handleConversationUpdate);
        socket.off('unreadCountUpdate', handleConversationUpdate);
      }
    };
  }, [authToken, currentUserId, socket]);

  if (loading) return <p className="p-4 text-gray-500 animate-pulse">Đang tải danh sách trò chuyện...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (conversations.length === 0) return <p className="p-4 text-gray-500">Không có cuộc trò chuyện nào.</p>;

  return (
    <ul className="divide-y divide-gray-200">
      {conversations.map(conv => (
        <li
          key={conv.mongo_conversation_id}
          onClick={() => onSelectConversation(conv.other_user_id, conv.mongo_conversation_id, conv.other_user_username, conv.other_user_avatar)}
          className={`p-3 flex items-center space-x-3 cursor-pointer transition-colors ${
            conv.mongo_conversation_id === activeConversationId ? 'bg-indigo-100' : 'hover:bg-gray-100'
          }`}
        >
          <div className="relative w-10 h-10">
            <Image
              src={conv.other_user_avatar || '/images/avatars/default-avatar.png'} // Cần có ảnh default
              alt={conv.other_user_username}
              fill
              className="rounded-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${conv.mongo_conversation_id === activeConversationId ? 'text-indigo-700' : 'text-gray-900'}`}>
              {conv.other_user_username}
            </p>
            <p className={`text-sm truncate ${conv.unread_count_mysql > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
              {conv.last_message_preview || 'Bắt đầu trò chuyện...'}
            </p>
          </div>
          <div className="text-xs text-gray-400 text-right space-y-1">
            <span>
              {conv.last_message_at_mysql && new Date(conv.last_message_at_mysql).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {conv.unread_count_mysql > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {conv.unread_count_mysql}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ConversationList;