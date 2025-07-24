import { Order } from "@/types";
import { API_URL, handleResponse } from "./auth";

export const getMyOrders = async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });
    return handleResponse<Order[]>(response);
};