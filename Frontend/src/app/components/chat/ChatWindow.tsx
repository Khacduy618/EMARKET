// // Frontend/components/chat/ChatWindow.tsx
// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import type { Socket } from 'socket.io-client';
// import Image from 'next/image'; // Sử dụng cho avatar nếu có

// interface MongoMessage {
//   _id: string;
//   conversationId: string;
//   senderId: number;
//   receiverId: number;
//   content: string;
//   messageType: string;
//   createdAt: string; // ISO Date String
//   senderInfo?: { username: string; avatarUrl?: string | null };
// }

// export interface ChatWindowProps {
//   socket: Socket | null; // Truyền socket instance từ ChatPage
//   conversationId: string; // _id của Conversation trong MongoDB
//   currentUserId: number;
//   otherUserId: number;
//   otherUsername: string; // Tên người đang chat cùng để hiển thị
//   otherUserAvatar?: string | null; // Avatar người đang chat cùng
//   currentUserInfo: {
//     username: string;
//     avatarUrl?: string | null;
//   };
//   authToken: string; // Để gọi API lấy lịch sử tin nhắn
// }

// const ChatWindow: React.FC<ChatWindowProps> = ({
//   socket,
//   conversationId,
//   currentUserId,
//   otherUserId,
//   otherUsername,
//   otherUserAvatar,
//   currentUserInfo,
//   authToken,
// }) => {
//   const [messages, setMessages] = useState<MongoMessage[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isLoadingHistory, setIsLoadingHistory] = useState(true);
//   const [sending, setSending] = useState(false);
//   const messagesEndRef = useRef<null | HTMLDivElement>(null);

//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   // Fetch message history và join room
//   useEffect(() => {
//     if (!socket || !conversationId || !authToken || !currentUserId)
      
//        return;

//     setIsLoadingHistory(true);
//     console.log(`ChatWindow: Joining conversation ${conversationId}`);
//     socket.emit('joinSpecificConversation', conversationId);

//     // Lấy lịch sử tin nhắn
//     // Socket.IO server có thể emit 'loadOldMessages' sau khi client join
//     // Hoặc client tự fetch từ API Laravel
//     const fetchMessageHistory = async () => {
//         try {
//             // Giả sử API Laravel trả về tin nhắn cho MongoDB conversation ID
//             // Endpoint này cần được tạo trong Laravel nếu bạn chọn cách này
//             // const response = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/chat/conversations/${conversationId}/messages-mongo`, {
//             //     headers: { 'Authorization': `Bearer ${authToken}` }
//             // });
//             // if (!response.ok) throw new Error('Failed to fetch message history');
//             // const data = await response.json();
//             // setMessages(data.messages || []);
//             // console.log("Message history loaded via API");

//             // Thay vào đó, chúng ta sẽ dựa vào event 'loadOldMessages' từ Socket.IO server
//             // (server sẽ emit event này sau khi client 'joinSpecificConversation')
//         } catch (error) {
//             console.error("Error fetching message history:", error);
//         } finally {
//             // setIsLoadingHistory(false); // Sẽ set false khi nhận được 'loadOldMessages'
//         }
//     };
//     // fetchMessageHistory(); // Quyết định xem client tự fetch hay chờ server emit

//     const handleLoadOldMessages = (data: { conversationId: string; messages: MongoMessage[] }) => {
//         if (data.conversationId === conversationId) {
//             console.log(`ChatWindow: Received 'loadOldMessages' for ${conversationId}`, data.messages);
//             setMessages(data.messages || []);
//             setIsLoadingHistory(false);
//         }
//     };

//     socket.on('loadOldMessages', handleLoadOldMessages);

//     return () => {
//         socket.off('loadOldMessages', handleLoadOldMessages);
//         // Không emit 'leaveConversation' ở đây, ChatPage sẽ quản lý việc join/leave tổng thể hơn
//     };

//   }, [socket, conversationId, authToken, currentUserId]);


//   // Lắng nghe tin nhắn mới
//   useEffect(() => {
//     if (!socket || !conversationId) return;

//     const handleNewMessage = (message: MongoMessage) => {
//       console.log(`ChatWindow: Received 'newMessage'`, message);
//       if (message.conversationId === conversationId) {
//         setMessages((prevMessages) => [...prevMessages, message]);
//       }
//     };
//     socket.on('newMessage', handleNewMessage);

//     return () => {
//       socket.off('newMessage', handleNewMessage);
//     };
//   }, [socket, conversationId]);


//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !socket || !socket.connected || !conversationId || sending) return;

//     setSending(true);
//     const messageData = {
//       conversationId: conversationId,
//       receiverId: otherUserId,
//       content: newMessage,
//       messageType: 'Text',
//       authToken: authToken, // Socket.IO server có thể cần để xác thực quyền gửi vào conversation này
//       senderInfo: currentUserInfo,
//     };

//     socket.emit('sendMessage', messageData, (response: any) => {
//         // Callback từ server (nếu server có ack)
//         if (response && response.error) {
//             console.error("Server returned error on sendMessage:", response.error);
//             // Xử lý lỗi hiển thị cho người dùng nếu cần
//             alert(`Lỗi gửi tin nhắn: ${response.error}`);
//         } else {
//             console.log("Message sent ack from server (if any):", response);
//             // Tin nhắn sẽ được thêm vào state messages thông qua event 'newMessage'
//             // để đảm bảo tính nhất quán (single source of truth là server)
//         }
//         setNewMessage(''); // Xóa input sau khi gửi (hoặc sau khi nhận ack thành công)
//         setSending(false);
//     });
//   };

//   return (
//     <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
//       {/* Header của ChatWindow */}
//       <div className="flex items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
//         <Image
//             src={otherUserAvatar || '/images/avatars/default-avatar.png'}
//             alt={otherUsername}
//             width={40}
//             height={40}
//             className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
//         />
//         <h2 className="text-base sm:text-lg font-semibold text-gray-700">{otherUsername}</h2>
//         {/* (Tùy chọn) Trạng thái online/offline */}
//       </div>

//       {/* Khung tin nhắn */}
//       <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-100">
//         {isLoadingHistory && <p className="text-center text-gray-500">Đang tải tin nhắn...</p>}
//         {!isLoadingHistory && messages.length === 0 && (
//             <p className="text-center text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
//         )}
//         {messages.map((msg) => (
//           <div
//             key={msg._id}
//             className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
//           >
//             <div className="flex items-end max-w-[70%] sm:max-w-[60%]">
//               {msg.senderId !== currentUserId && msg.senderInfo?.avatarUrl && (
//                 <Image
//                   src={msg.senderInfo.avatarUrl}
//                   alt={msg.senderInfo.username || ''}
//                   width={24} height={24}
//                   className="w-6 h-6 rounded-full mr-2 self-start"
//                 />
//               )}
//                {msg.senderId === currentUserId && msg.senderInfo?.avatarUrl && (
//                 <div className="w-6 h-6 mr-2 flex-shrink-0"></div> // Placeholder để căn chỉnh
//               )}
//               <div
//                 className={`px-3 py-2 rounded-xl shadow-sm ${
//                   msg.senderId === currentUserId
//                     ? 'bg-indigo-600 text-white rounded-br-none'
//                     : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
//                 }`}
//               >
//                 <p className="text-sm">{msg.content}</p>
//                 <p className={`text-xs mt-1 opacity-70 text-right ${msg.senderId === currentUserId ? 'text-indigo-200' : 'text-gray-500'}`}>
//                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//               </div>
//                {msg.senderId === currentUserId && msg.senderInfo?.avatarUrl && (
//                 <Image
//                   src={msg.senderInfo.avatarUrl}
//                   alt={msg.senderInfo.username || ''}
//                   width={24} height={24}
//                   className="w-6 h-6 rounded-full ml-2 self-start"
//                 />
//               )}
//               {msg.senderId !== currentUserId && msg.senderInfo?.avatarUrl && (
//                 <div className="w-6 h-6 ml-2 flex-shrink-0"></div> // Placeholder
//               )}
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Khung nhập tin nhắn */}
//       <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex items-center rounded-b-lg">
//         {/* (Tùy chọn) Nút đính kèm file/ảnh */}
//         {/* <button type="button" className="p-2 text-gray-500 hover:text-gray-700">...</button> */}
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Nhập tin nhắn..."
//           className="flex-grow border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//           disabled={sending}
//         />
//         <button
//           type="submit"
//           className="ml-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
//           disabled={!socket?.connected || !conversationId || !newMessage.trim() || sending}
//         >
//           {sending ? 'Đang gửi...' : (
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
//               <path d="M3.105 3.105a.5.5 0 01.814-.098l12.448 8.663a.5.5 0 010 .866L3.919 20.993a.5.5 0 01-.814-.098l-.001-.001Z" />
//               <path d="M3.105 3.105a.5.5 0 01.814-.098l12.448 8.663a.5.5 0 010 .866L3.919 20.993a.5.5 0 01-.814-.098l-.001-.001Z" />
//             </svg>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatWindow;


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


//   return (
//     <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
//       {/* Header của ChatWindow */}
//       <div className="flex items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
//         <Image
//             src={otherUserAvatar || '/images/avatars/default-avatar.png'}
//             alt={otherUsername}
//             width={40}
//             height={40}
//             className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
//         />
//         <h2 className="text-base sm:text-lg font-semibold text-gray-700">{otherUsername}</h2>
//       </div>

//       {/* Khung tin nhắn */}
//       <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-100">
//         {isLoadingHistory && <p className="text-center text-gray-500">Đang tải tin nhắn...</p>}
//         {!isLoadingHistory && messages.length === 0 && (
//             <p className="text-center text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
//         )}
//         {messages.map((msg) => (
//           <div
//             key={msg._id} // Sử dụng _id từ MongoDB
//             className={`flex w-full ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
//           >
//             <div className="flex items-end max-w-[70%] sm:max-w-[60%]">
//               {/* Avatar người gửi (nếu không phải user hiện tại) */}
//               {msg.senderId !== currentUserId && msg.senderInfo?.avatarUrl && (
//                 <Image
//                   src={msg.senderInfo.avatarUrl}
//                   alt={msg.senderInfo.username || ''}
//                   width={24} height={24}
//                   className="w-6 h-6 rounded-full mr-2 self-start flex-shrink-0"
//                 />
//               )}
//               {/* Placeholder để căn chỉnh nếu là user hiện tại và có avatar */}
//                {msg.senderId === currentUserId && currentUserInfo?.avatarUrl && (
//                 <div className="w-6 h-6 ml-2 flex-shrink-0 order-2"></div>
//               )}

//               <div
//                 className={`px-3 py-2 rounded-xl shadow-sm ${
//                   msg.senderId === currentUserId
//                     ? 'bg-indigo-600 text-white rounded-br-none order-1' // Tin nhắn của mình
//                     : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' // Tin nhắn của người khác
//                 }`}
//               >
//                 {/* Tên người gửi nếu là group chat hoặc cần thiết */}
//                 {/* {msg.senderId !== currentUserId && msg.senderInfo?.username && (
//                     <p className="text-xs font-medium mb-0.5 text-gray-600">{msg.senderInfo.username}</p>
//                 )} */}
//                 <p className="text-sm break-words">{msg.content}</p>
//                 <p className={`text-xs mt-1 opacity-70 text-right ${msg.senderId === currentUserId ? 'text-indigo-200' : 'text-gray-500'}`}>
//                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//               </div>

//               {/* Avatar người gửi (nếu là user hiện tại) */}
//               {msg.senderId === currentUserId && currentUserInfo?.avatarUrl && (
//                 <Image
//                   src={currentUserInfo.avatarUrl}
//                   alt={currentUserInfo.username || ''}
//                   width={24} height={24}
//                   className="w-6 h-6 rounded-full ml-2 self-start order-2 flex-shrink-0"
//                 />
//               )}
//                {/* Placeholder để căn chỉnh nếu là người khác và có avatar */}
//               {msg.senderId !== currentUserId && msg.senderInfo?.avatarUrl && (
//                 <div className="w-6 h-6 mr-2 flex-shrink-0"></div>
//               )}
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} /> {/* Phần tử rỗng ở cuối để cuộn tới */}
//       </div>

//       {/* Khung nhập tin nhắn */}
//       <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex items-center rounded-b-lg">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Nhập tin nhắn..."
//           className="flex-grow border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//           disabled={sending}
//         />
//         <button
//           type="submit"
//           className="ml-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
//           disabled={!socket?.connected || !conversationId || !newMessage.trim() || sending}
//         >
//           {sending ? 'Đang gửi...' : (
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
//               <path d="M3.105 3.105a.5.5 0 01.814-.098l12.448 8.663a.5.5 0 010 .866L3.919 20.993a.5.5 0 01-.814-.098l-.001-.001Z" />
//             </svg>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

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