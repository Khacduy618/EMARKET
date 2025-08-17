// services/reviewService.ts

import axios from 'axios';
import { getAuthToken } from './api'; // Hàm lấy token của bạn
import type { AdminReview, ReviewStatus } from '@/types';
import { API_URL } from '@/lib/config';


interface UpdateStatusPayload {
  status: ReviewStatus;
  resolveRequest?: boolean; // Cờ để báo backend đóng yêu cầu của shop
}

export const updateReviewStatus = async (
  reviewId: number,
  payload: UpdateStatusPayload
): Promise<AdminReview> => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/reviews/${reviewId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        
      }
    );
    // API nên trả về review đã được cập nhật
    return response.data.data;
  } catch (error) {
    // Xử lý lỗi và ném ra để component có thể bắt được
    console.error(`Lỗi khi cập nhật review #${reviewId}:`, error);
    throw error;
  }
};