// Frontend/lib/socket.js
import { io } from 'socket.io-client';

let socketInstance = null;

// Nên lấy URL từ biến môi trường
const SOCKET_SERVER_URL = 'http://localhost:3002';

export const getSocket = (authToken, userId) => {
  console.log(`[SocketLib] Attempting to get/create socket. URL: ${SOCKET_SERVER_URL}, Token: ${authToken ? 'Exists' : 'Missing'}, UserID: ${userId}`);
  if (!socketInstance) {
    console.log('[SocketLib] AuthToken being sent to socket auth:', authToken ? authToken.substring(0, 30) + "..." : "No Token");
    console.log('[SocketLib] UserID being sent to socket auth:', userId);

    // socketInstance = io(SOCKET_SERVER_URL, {
    //   autoConnect: false, // Sẽ kết nối thủ công khi cần
    //   auth: { // Gửi token và userId để server xác thực
    //     token: authToken,
    //     userId: Number(userId) // Đảm bảo userId là số
    //   },
    //   reconnectionAttempts: 3, // Số lần thử kết nối lại
    //   reconnectionDelay: 3000, // Thời gian chờ giữa các lần thử (ms)
    // });

    socketInstance = io(SOCKET_SERVER_URL, {
      autoConnect: false,
      auth: {
        token: authToken,
        userId: Number(userId)
      },
      reconnectionAttempts: 3, // Giảm số lần thử lại để debug nhanh hơn
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'] // Cho phép cả hai
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message, err.data);
      // Xử lý lỗi kết nối, ví dụ: thông báo cho người dùng, thử kết nối lại sau
      // Có thể set một state lỗi ở đây để hiển thị trên UI
      if (err.data) console.error('[SocketLib] Error data:', err.data);
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // a purposeful disconnect by the server,socket will not try to reconnect
        socketInstance.connect(); // Cố gắng kết nối lại nếu server chủ động ngắt
      }
      // else the socket will automatically try to reconnect
    });

    // Các event listener chung khác có thể đặt ở đây nếu cần
    // Ví dụ: lắng nghe lỗi chung từ server
    socketInstance.on('serverError', (errorData) => {
      console.error('Server-side socket error:', errorData);
      // Hiển thị thông báo lỗi cho người dùng
    });

  }

  if (authToken && userId && !socketInstance.active) { // Dùng socketInstance.active để kiểm tra nếu nó đã cố gắng kết nối trước đó
    console.log('[SocketLib] Auth info present, attempting to connect socket manually...');
    socketInstance.auth = { token: authToken, userId: Number(userId) }; // Luôn cập nhật auth trước khi connect
    socketInstance.connect();
  } else if (!authToken || !userId) {
    console.warn('[SocketLib] AuthToken or UserID is missing, socket will not connect.');
  }

  // Nếu instance đã có nhưng chưa kết nối (ví dụ sau khi disconnect) và có auth info
  if (!socketInstance.connected && authToken && userId) {
    // Cập nhật lại auth object trước khi kết nối lại, nếu token có thể thay đổi
    socketInstance.auth = { token: authToken, userId: Number(userId) };
    console.log('Attempting to manually connect socket...');
    socketInstance.connect();
  } else if (socketInstance.connected && authToken && userId) {
    // Nếu đã kết nối, đảm bảo auth object được cập nhật nếu token/userId thay đổi
    // Điều này ít khi xảy ra nếu socket được quản lý tốt theo session user
    if (socketInstance.auth.token !== authToken || socketInstance.auth.userId !== Number(userId)) {
      console.warn("Auth token/userId changed while socket connected. Re-evaluating connection strategy.");
      // Có thể cần disconnect và connect lại với auth mới, hoặc server có cơ chế cập nhật auth
    }
  }


  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    console.log('Manually disconnecting socket...');
    socketInstance.disconnect();
  }
  socketInstance = null; // Quan trọng: reset instance để lần sau getSocket sẽ tạo mới
};