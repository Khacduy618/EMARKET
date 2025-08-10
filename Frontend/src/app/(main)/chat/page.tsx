// // app/chats/page.tsx
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../../api/chat/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";
// import ChatLayout from "../../components/chat/ChatLayout";
// import { headers } from "next/headers"; // Dùng để lấy cookie

// interface ApiConversation {
//   id: string;
//   name: string;
//   avatar?: string;
//   lastMessage: {
//     text: string;
//   };
// }
// // app/chats/page.tsx

// // ... (phần import và interface giữ nguyên)

// async function getConversations(): Promise<ApiConversation[]> {
//   // Lấy đối tượng headers thực sự bằng cách dùng AWAIT
//   const headerList = headers();

//   // Lấy URL của chính server Next.js
//   const host = headerList.get("host");
//   const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

//   try {
//     // Gọi API route nội bộ, cần truyền cookie để xác thực session
//     const res = await fetch(`${protocol}://${host}/api/chat/conversations`, {
//       method: 'GET',
//       headers: {
//         // Sử dụng headerList để lấy cookie
//         'Cookie': headerList.get('cookie') || '',
//       },
//       cache: 'no-store',
//     });

//     if (!res.ok) {
//       console.error("Failed to fetch conversations:", await res.text());
//       return [];
//     }

//     return await res.json();
//   } catch (error) {
//     console.error("Error fetching conversations:", error);
//     return [];
//   }
// }

// // ... (phần component ChatsPage giữ nguyên)

// export default async function ChatsPage() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     redirect('/login?callbackUrl=/chats');
//   }

//   // Lấy dữ liệu thật từ API Route của Next.js
//   const conversationsData = await getConversations();

//   // Định dạng lại dữ liệu để phù hợp với component ChatLayout
//   const formattedForLayout = conversationsData.map(convo => ({
//     id: convo.id,
//     name: convo.name,
//     lastMessage: convo.lastMessage.text,
//   }));

//   return (
//     <div className="h-screen bg-gray-100">
//       <ChatLayout
//         currentUser={session.user}
//         conversations={formattedForLayout}
//       />
//     </div>
//   );
// }
// app/chats/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/chat/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ChatLayout from "../../components/chat/ChatLayout"; // Sửa lại đường dẫn này cho đúng
import { getConversationsForUser } from "../../../lib/chatService"; // Import hàm service
type ConversationData = {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: {
    text: string;
  };
} | null; // Thêm null vì hàm map có thể trả về null trước khi filter

export default async function ChatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/chats');
  }

  // Bước 2: Sử dụng kiểu đã định nghĩa để khai báo biến
  let conversationsData: NonNullable<ConversationData>[] = [];

  try {
    // getConversationsForUser trả về (ConversationData | null)[]
    // nhưng sau khi filter, nó sẽ là NonNullable<ConversationData>[]
    const result = await getConversationsForUser(session.user.id);
    conversationsData = result as NonNullable<ConversationData>[];

  } catch (error) {
    console.error("Lỗi khi tải trang Chat:", error);
  }

  // Bước 3: Đoạn map bây giờ sẽ an toàn về kiểu, không cần dấu `!`
  const formattedForLayout = conversationsData.map(convo => ({
    id: convo.id,
    name: convo.name,
    lastMessage: convo.lastMessage.text,
  }));

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[calc(100vh-2rem)]">
        <ChatLayout
          currentUser={session.user}
          conversations={formattedForLayout}
        />
      </div>
    </div>
  );
}