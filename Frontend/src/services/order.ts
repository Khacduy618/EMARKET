import { Order } from "@/types";
import {  handleResponse } from "./auth";
import { API_URL } from "@/lib/config";

export const getMyOrders = async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });
    return handleResponse<Order[]>(response);
};