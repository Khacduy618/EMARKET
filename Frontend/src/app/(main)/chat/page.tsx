// Frontend/app/(main)/(account)/chat/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';

import { getSocket, disconnectSocket } from '../../../../lib/socket';
import type { Socket } from 'socket.io-client';
import ConversationList, {ConversationMeta} from '@/app/components/chat/ConversationList';

import ChatWindow from '@/app/components/chat/ChatWindow';
import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from 'next/navigation';

// --- START: Phần Giả Định Xác Thực - BẠN CẦN THAY THẾ BẰNG LOGIC CỦA MÌNH ---
interface UserSession {
  userId: number | null;
  token: string | null;
  userInfo: {
    username: string;
    avatarUrl?: string | null;
  } | null;
  isLoading: boolean;
}

// Tạo một AuthContext đơn giản để minh họa
const AuthContext = createContext<UserSession | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<UserSession>({
    userId: null,
    token: null,
    userInfo: null,
    isLoading: true,
  });
const router = useRouter();
  useEffect(() => {
    // Giả lập việc lấy session sau khi component mount
    const timer = setTimeout(() => {
      // Trong thực tế, bạn sẽ gọi API hoặc đọc từ localStorage/cookie
      const storedToken =localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setSession({
                userId: parsedUser.UserID, // Giả sử user object có id, username, avatarUrl
                token: storedToken,
                userInfo: { username: parsedUser.Username, avatarUrl: parsedUser.Avatar },
                isLoading: false,
            });
        } catch (e) {
            console.error("Failed to parse stored user session", e);
            // Xử lý lỗi, có thể clear localStorage
             localStorage.removeItem('authToken');
             localStorage.removeItem('user');
             setSession({ userId: null, token: null, userInfo: null, isLoading: false });
        }
      } else {
            router.push('/login');
      }
    }, 500); // Giả lập thời gian chờ
    return () => clearTimeout(timer);
  }, []);

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// --- END: Phần Giả Định Xác Thực ---


const ChatPageContent = () => {
  const { userId: currentUserId, token: authToken, userInfo: currentUserInfo, isLoading: authLoading } = useAuth();

  const [selectedConversation, setSelectedConversation] = useState<ConversationMeta | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Khởi tạo và quản lý socket instance
  useEffect(() => {
    if (authToken && currentUserId && !socketInstance) {
      console.log("ChatPage: Attempting to initialize and connect socket...");
      const newSocket = getSocket(authToken, currentUserId);
      if (!newSocket.connected) { // getSocket có thể trả về instance cũ chưa connect
        newSocket.connect();
      }
      setSocketInstance(newSocket);
    }

    // Cleanup socket connection on component unmount or when auth changes
    return () => {
      if (socketInstance && socketInstance.connected) {
        console.log("ChatPage: Disconnecting socket on unmount/auth change.");
        // Quyết định xem có nên disconnect hoàn toàn hay chỉ leave rooms
        // disconnectSocket(); // Điều này sẽ reset socketInstance về null
        socketInstance.disconnect(); // Chỉ disconnect, instance vẫn còn nếu getSocket trả về cái cũ
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, currentUserId]); // Chỉ chạy lại khi auth thay đổi

  const handleSelectConversation = useCallback((
    otherUserId: number,
    mongoConversationId: string,
    otherUserName: string,
    otherUserAvatar?: string | null
  ) => {
    setSelectedConversation({
      mongo_conversation_id: mongoConversationId,
      other_user_id: otherUserId,
      other_user_username: otherUserName,
      other_user_avatar: otherUserAvatar,
      unread_count_mysql: 0, // Giả định khi chọn là đã đọc
      // last_message_preview, last_message_at_mysql nên được cập nhật từ ConversationList nếu cần
    });

    if (socketInstance && mongoConversationId) {
      socketInstance.emit('markConversationAsRead', { conversationId: mongoConversationId });
    }
  }, [socketInstance]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (!authToken || !currentUserId || !currentUserInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Vui lòng <a href="/login" className="text-indigo-600 hover:underline">đăng nhập</a> để sử dụng tính năng chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height,64px))] antialiased text-gray-800 bg-gray-100">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {/* Sidebar danh sách cuộc trò chuyện */}
        <div className="flex flex-col py-4 sm:py-8 pl-2 sm:pl-6 pr-2 w-full sm:w-64 md:w-72 lg:w-80 bg-white flex-shrink-0 border-r border-gray-200">
          <div className="flex flex-row items-center justify-center h-12 w-full px-2">
            <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
              {/* SVG Icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <div className="ml-2 font-bold text-xl sm:text-2xl text-gray-800">Tin nhắn</div>
          </div>
          <div className="flex flex-col mt-4 -mx-2 overflow-y-auto">
            {socketInstance && (
              <ConversationList
                authToken={authToken}
                currentUserId={currentUserId}
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
              currentUserId={currentUserId}
              currentUserInfo={currentUserInfo}
              authToken={authToken}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <p className="text-gray-500 text-lg">Chọn một cuộc trò chuyện để bắt đầu.</p>
              <p className="text-sm text-gray-400 mt-2">Hoặc tìm kiếm người dùng để bắt đầu cuộc trò chuyện mới.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component để cung cấp AuthContext cho ChatPageContent
const ChatPageWithAuthProvider = () => (
    <AuthProvider>
        <ChatPageContent />
    </AuthProvider>
);

export default ChatPageWithAuthProvider;
// Hoặc nếu bạn đã có AuthProvider ở cấp cao hơn (ví dụ trong layout),
// thì chỉ cần export default ChatPageContent; và đổi tên file cho phù hợp.