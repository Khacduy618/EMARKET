// File: Frontend/app/(main)/(account)/chat/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../../../../lib/socket';
import type { Socket } from 'socket.io-client';

// Import các thành phần UI
import ConversationList, { ConversationMeta } from '@/app/components/chat/ConversationList';
import ChatWindow from '@/app/components/chat/ChatWindow';

// QUAN TRỌNG: Import hook useAuth từ AuthContext toàn cục của bạn
import { useAuth } from '@/context/AuthContext';

// Không cần AuthProvider ở đây nữa, vì nó đã được bọc ở layout.tsx

export default function ChatPage() {
  // Lấy dữ liệu trực tiếp từ Context
  const { user, token, isLoading } = useAuth();

  const [selectedConversation, setSelectedConversation] = useState<ConversationMeta | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Khởi tạo và quản lý socket instance
  useEffect(() => {
    if (token && user?.UserID && !socketInstance) {
      console.log("ChatPage: Attempting to initialize socket...");
      const newSocket = getSocket(token, user.UserID);
      if (!newSocket.connected) {
        newSocket.connect();
      }
      setSocketInstance(newSocket);
    }

    return () => {
      if (socketInstance && socketInstance.connected) {
        console.log("ChatPage: Disconnecting socket on unmount.");
        socketInstance.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]); 

  const handleSelectConversation = useCallback((
    otherUserId: number, mongoConversationId: string, otherUserName: string, otherUserAvatar?: string | null
  ) => {
    setSelectedConversation({
      mongo_conversation_id: mongoConversationId, other_user_id: otherUserId, other_user_username: otherUserName, other_user_avatar: otherUserAvatar, unread_count_mysql: 0,
    });
    if (socketInstance && mongoConversationId) {
      socketInstance.emit('markConversationAsRead', { conversationId: mongoConversationId });
    }
  }, [socketInstance]);

  // Giao diện khi AuthContext đang tải (AuthContext đã xử lý việc này, nhưng đây là một lớp bảo vệ thêm)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }
  
  // AuthContext đã xử lý chuyển hướng, nhưng đây là lớp bảo vệ cuối
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Đang chuyển hướng đến trang đăng nhập...</p>
      </div>
    );
  }

  // Giao diện chính của trang Chat
  const currentUserInfo = { username: user.Username, avatarUrl: user.Avatar };

  return (
    <div className="flex h-[calc(100vh-var(--header-height,64px))] antialiased text-gray-800 bg-gray-100">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {/* Sidebar */}
        <div className="flex flex-col py-4 sm:py-8 pl-2 sm:pl-6 pr-2 w-full sm:w-64 md:w-72 lg:w-80 bg-white flex-shrink-0 border-r border-gray-200">
          <div className="flex flex-row items-center justify-center h-12 w-full px-2">
            <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <div className="ml-2 font-bold text-xl sm:text-2xl text-gray-800">Tin nhắn</div>
          </div>
          <div className="flex flex-col mt-4 -mx-2 overflow-y-auto">
            {socketInstance && (
              <ConversationList
                authToken={token}
                currentUserId={user.UserID}
                onSelectConversation={handleSelectConversation}
                socket={socketInstance}
                activeConversationId={selectedConversation?.mongo_conversation_id || null}
              />
            )}
            {!socketInstance && <p className="p-4 text-gray-400 text-sm">Đang kết nối server chat...</p>}
          </div>
        </div>

        {/* Khung chat chính */}
        <div className="flex flex-col flex-auto h-full p-2 sm:p-6">
          {selectedConversation && socketInstance ? (
            <ChatWindow
              key={selectedConversation.mongo_conversation_id}
              socket={socketInstance}
              conversationId={selectedConversation.mongo_conversation_id}
              otherUserId={selectedConversation.other_user_id}
              otherUsername={selectedConversation.other_user_username}
              otherUserAvatar={selectedConversation.other_user_avatar}
              currentUserId={user.UserID}
              currentUserInfo={currentUserInfo}
              authToken={token}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <p className="text-gray-500 text-lg">Chọn một cuộc trò chuyện để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}