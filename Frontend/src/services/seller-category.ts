import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function getPlatformCategories() {
    const response = await api.get('/platform-categories');
    return response.data.data;
}

export async function getShopCategories() {
    const response = await api.get('/shop-categories');
    return response.data.data;
}

export async function registerCategory(categoryID: number) {
    const response = await api.post('/shop-categories', { CategoryID: categoryID });
    return response.data;
}

export async function deleteCategory(shopCategoryID: number) {
    const response = await api.delete(`/shop-categories/${shopCategoryID}`);
    return response.data;
}