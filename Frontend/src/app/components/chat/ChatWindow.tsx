

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

interface UserInfo {
  id: string;
  name?: string | null;
}

interface ChatWindowProps {
  otherUser: UserInfo;
}

export function ChatWindow({ otherUser }: ChatWindowProps) {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Tạo ID cuộc hội thoại phải nhất quán, không phụ thuộc vào thứ tự
  const conversationId = currentUser ? [currentUser.id, otherUser.id].sort().join('_') : null;

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Lắng nghe tin nhắn mới từ Firestore
  useEffect(() => {
    if (!conversationId) return;
    setIsLoading(true);

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(fetchedMessages);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Dọn dẹp listener khi component bị hủy
  }, [conversationId]);

  // Xử lý việc gửi tin nhắn
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !conversationId) return;

    // Gọi API Route để gửi tin nhắn một cách an toàn
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        text: newMessage,
      }),
    });
    setNewMessage('');
  };

  if (!currentUser) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

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

      {/* Danh sách tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading && <div className="text-center text-gray-400">Đang tải tin nhắn...</div>}
        {!isLoading && messages.map((msg) => (
          <div key={msg.id} className={`flex mb-3 ${msg.uid === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-[70%] ${msg.uid === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.uid !== currentUser.id && <p className="font-bold text-xs pb-1 text-gray-600">{msg.uname}</p>}
              <p className="text-sm break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Form nhập tin nhắn */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex bg-gray-50">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoComplete="off"
        />
        <button type="submit" className="bg-blue-500 text-white px-5 py-2 rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-blue-300" disabled={!newMessage.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}