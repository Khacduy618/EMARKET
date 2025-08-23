import axios from 'axios';
import type { AdminReview, ReviewStatus } from '@/types';
import { API_URL } from '@/lib/config';

interface UpdateStatusPayload {
  status: ReviewStatus;
  resolveRequest?: boolean;
}

export const updateReviewStatus = async (
  reviewId: number,
  payload: UpdateStatusPayload
): Promise<AdminReview> => {
  try {
    const response = await axios.put(`${API_URL}/admin/reviews/${reviewId}/status`, payload, {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating review #${reviewId}:`, error);
    throw new Error('Cập nhật trạng thái thất bại.');
  }
};