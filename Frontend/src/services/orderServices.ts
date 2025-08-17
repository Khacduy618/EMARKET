import { API_URL } from "@/lib/config";
import { PaginatedOrders } from "@/types/order.interface";

// Hàm helper fetch
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Có lỗi xảy ra từ API');
  }
  return res.json();
}

export const orderService = {
  /**
   * Lấy danh sách đơn hàng cho admin có phân trang
   * @param page - Số trang muốn lấy
   */
  getAllOrders: async (page: number = 1): Promise<PaginatedOrders> => {
    return apiFetch(`/orderadmin?page=${page}`);
  },

  /**
   * Lấy chi tiết đơn hàng theo ID người mua
   */
  getOrderDetail: async (orderBuyerId: number) => {
    return apiFetch(`/orders/${orderBuyerId}`);
  },

  /**
   * Lấy danh sách các item của đơn hàng
   */
  getOrderItems: async (orderId: number) => {
    return apiFetch(`/orders/${orderId}/items`);
  },

  /**
   * Lấy chi tiết một item đơn hàng
   */
  getOrderItemDetail: async (orderItemId: number) => {
    return apiFetch(`/order-items/${orderItemId}`);
  }
};
