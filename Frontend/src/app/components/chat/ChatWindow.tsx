

// Frontend/components/chat/ChatWindow.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import Image from 'next/image';
import { JSX } from 'react/jsx-runtime';

interface MongoMessage {
  _id: string;
  conversationId: string;
  senderId: number;
  receiverId: number;
  content: string;
  messageType: string;
  createdAt: string; // ISO Date String
  senderInfo?: { username: string; avatarUrl?: string | null };
}

export interface ChatWindowProps {
  socket: Socket | null;
  conversationId: string;
  currentUserId: number;
  otherUserId: number;
  otherUsername: string;
  otherUserAvatar?: string | null;
  currentUserInfo: {
    username: string;
    avatarUrl?: string | null;
  };
  authToken: string;
}
// Hàm helper để định dạng ngày tháng
const formatDateSeparator = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return 'Hôm nay';
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  } else {
    // Hiển thị ngày/tháng/năm hoặc Thứ, ngày tháng
    return messageDate.toLocaleDateString('vi-VN', {
      weekday: 'long', // 'short', 'long', 'narrow'
      year: 'numeric', // 'numeric', '2-digit'
      month: 'long',  // 'numeric', '2-digit', 'long', 'short', 'narrow'
      day: 'numeric'    // 'numeric', '2-digit'
    });
    // Hoặc đơn giản hơn:
    // return messageDate.toLocaleDateString('vi-VN');
  }
};
const ChatWindow: React.FC<ChatWindowProps> = ({
  socket,
  conversationId,
  currentUserId,
  otherUserId,
  otherUsername,
  otherUserAvatar,
  currentUserInfo,
  authToken,
}) => {
  const [messages, setMessages] = useState<MongoMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null); // Ref cho div chứa tin nhắn
  const messagesEndRef = useRef<null | HTMLDivElement>(null); // Ref cho phần tử ở cuối để scroll tới

  // Hàm cuộn xuống dưới cùng của danh sách tin nhắn
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Hoặc nếu muốn cuộn ngay lập tức không có hiệu ứng "smooth" khi tải lần đầu:
    // if (messagesContainerRef.current) {
    //   messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    // }
  }, []);

  // Tự động cuộn xuống khi có tin nhắn mới hoặc khi messages được load lần đầu
  useEffect(() => {
    if (messages.length > 0 && !isLoadingHistory) { // Chỉ scroll khi đã load xong và có tin nhắn
        scrollToBottom();
    }
  }, [messages, isLoadingHistory, scrollToBottom]);

  // Fetch message history và join room
  useEffect(() => {
    if (!socket || !conversationId || !authToken || !currentUserId) return;

    setIsLoadingHistory(true);
    console.log(`ChatWindow Effect: Attempting to join and load for conversationId: ${conversationId}. Socket connected: ${socket.connected}`);
    socket.emit('joinSpecificConversation', conversationId);

    const handleLoadOldMessages = (data: { conversationId: string; messages: MongoMessage[] }) => {
      console.log(`ChatWindow: <<<< RECEIVED 'loadOldMessages' event >>>> for convID ${data.conversationId}`);
      if (data.conversationId === conversationId) {
        setMessages(data.messages || []); // Server đã sort CŨ -> MỚI
        console.log(`ChatWindow: Updated messages for ${conversationId}. Count: ${data.messages?.length}`);
        // Cuộn xuống cuối sau khi load tin nhắn cũ
        // setTimeout(scrollToBottom, 0); // Đảm bảo DOM đã cập nhật
      } else {
        console.warn(`ChatWindow: Received messages for a different conversation (${data.conversationId}), current is ${conversationId}. Ignoring.`);
      }
      setIsLoadingHistory(false);
    };

    const handleConversationError = (errorData: { message: string }) => {
      console.error(`ChatWindow: <<<< RECEIVED 'conversationError' >>>> from server:`, errorData.message);
      setIsLoadingHistory(false);
      alert(`Lỗi tải cuộc trò chuyện: ${errorData.message}`);
    };

    socket.on('loadOldMessages', handleLoadOldMessages);
    socket.on('conversationError', handleConversationError);

    return () => {
      console.log(`ChatWindow cleanup: Removing listeners for conversationId: ${conversationId}`);
      socket.off('loadOldMessages', handleLoadOldMessages);
      socket.off('conversationError', handleConversationError);
      if (conversationId) {
        socket.emit('leaveConversation', conversationId);
        console.log(`ChatWindow cleanup: Emitted 'leaveConversation' for ${conversationId}`);
      }
    };
  }, [socket, conversationId, authToken, currentUserId]); // Bỏ scrollToBottom ra khỏi dependency vì nó là useCallback

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (message: MongoMessage) => {
      console.log(`ChatWindow: Received 'newMessage'`, message);
      if (message.conversationId === conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]); // Thêm vào cuối mảng
      }
    };
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, conversationId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !socket.connected || !conversationId || sending) return;

    setSending(true);
    const messageData = {
      conversationId: conversationId,
      receiverId: otherUserId,
      content: newMessage,
      messageType: 'Text',
      authToken: authToken,
      senderInfo: currentUserInfo,
    };

    socket.emit('sendMessage', messageData, (response: any) => {
      if (response && response.error) {
        console.error("Server returned error on sendMessage:", response.error);
        alert(`Lỗi gửi tin nhắn: ${response.error}`);
      } else {
        console.log("Message sent ack from server (if any):", response);
        // Tin nhắn được thêm vào state messages qua event 'newMessage'
      }
      setNewMessage('');
      setSending(false);
    });
  };
  const renderMessagesWithDateSeparators = () => {
    let lastMessageDate: string | null = null;
    const messageElements: JSX.Element[] = [];

    messages.forEach((msg, index) => {
      const messageDate = new Date(msg.createdAt).toDateString();
      if (messageDate !== lastMessageDate) {
        messageElements.push(
          <div key={`date-${messageDate}-${index}`} className="my-4 flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
              {formatDateSeparator(msg.createdAt)}
            </span>
          </div>
        );
        lastMessageDate = messageDate;
      }

      messageElements.push(
        <div
          key={msg._id}
          className={`flex w-full ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div className="flex items-end max-w-[70%] sm:max-w-[60%]">
            {msg.senderId !== currentUserId && msg.senderInfo?.avatarUrl && (
              <Image
                src={msg.senderInfo.avatarUrl}
                alt={msg.senderInfo.username || ''}
                width={24} height={24}
                className="w-6 h-6 rounded-full mr-2 self-start flex-shrink-0"
              />
            )}
             {msg.senderId === currentUserId && currentUserInfo?.avatarUrl && (
              <div className="w-6 h-6 ml-2 flex-shrink-0 order-2"></div>
            )}
            <div
              className={`px-3 py-2 rounded-xl shadow-sm ${
                msg.senderId === currentUserId
                  ? 'bg-indigo-600 text-white rounded-br-none order-1'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{msg.content}</p>
              <p className={`text-xs mt-1 opacity-70 text-right ${msg.senderId === currentUserId ? 'text-indigo-200' : 'text-gray-500'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.senderId === currentUserId && currentUserInfo?.avatarUrl && (
              <Image
                src={currentUserInfo.avatarUrl}
                alt={currentUserInfo.username || ''}
                width={24} height={24}
                className="w-6 h-6 rounded-full ml-2 self-start order-2 flex-shrink-0"
              />
            )}
            {msg.senderId !== currentUserId && !msg.senderInfo?.avatarUrl && ( // Placeholder nếu người khác không có avatar
                <div className="w-6 h-6 mr-2 flex-shrink-0"></div>
            )}
          </div>
        </div>
      );
    });
    return messageElements;
  };


return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      <div className="flex items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <Image
            src={otherUserAvatar || '/images/avatars/default-avatar.png'}
            alt={otherUsername}
            width={40} height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
        />
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">{otherUsername}</h2>
      </div>

      <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-1 bg-gray-100"> {/* Giảm space-y nếu cần */}
        {isLoadingHistory && <p className="text-center text-gray-500 py-10">Đang tải tin nhắn...</p>}
        {!isLoadingHistory && messages.length === 0 && (
            <p className="text-center text-gray-500 py-10">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
        )}
        {!isLoadingHistory && messages.length > 0 && renderMessagesWithDateSeparators()}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex items-center rounded-b-lg">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-grow border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          type="submit"
          className="ml-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={!socket?.connected || !conversationId || !newMessage.trim() || sending}
        >
          {/* ... SVG icon ... */}
          {sending ? 'Đang gửi...' : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 3.105a.5.5 0 01.814-.098l12.448 8.663a.5.5 0 010 .866L3.919 20.993a.5.5 0 01-.814-.098l-.001-.001Z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;