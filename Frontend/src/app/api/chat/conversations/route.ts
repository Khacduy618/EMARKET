// app/api/chat/conversations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/chat/auth/[...nextauth]/route'; // Đảm bảo đường dẫn này đúng
import { getConversationsForUser } from '@/lib/chatService'; // Import hàm service

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const conversations = await getConversationsForUser(session.user.id);
        return NextResponse.json(conversations, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}