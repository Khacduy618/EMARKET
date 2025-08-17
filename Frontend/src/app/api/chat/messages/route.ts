import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
    const { conversationId, text, userId, userName } = await request.json();

    // --- CẢNH BÁO BẢO MẬT ---
    // Trong ứng dụng thật, bạn phải xác thực userId từ session hoặc JWT token
    // chứ không được tin tưởng userId gửi từ client.
    if (!userId || !conversationId || !text) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    try {
        const messagePayload = {
            text,
            uid: userId,
            uname: userName,
            createdAt: new Date(),
        };

        const messagesRef = adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('messages');

        await messagesRef.add(messagePayload);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}