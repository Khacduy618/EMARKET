import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Swal.fire({
        title: 'Unauthorized!',
        text: error.response?.data?.message || 'You are not authorized to access this resource',
        icon: 'error',
        draggable: true,
      }).then(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      });
    }
    return Promise.reject(error);
  }
);

export interface Attribute {
  AttributeID: number;
  Name: string;
}

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

export async function login(email: string, password: string) {
  const response = await api.post('/login', { email, password });
  return response.data;
}

export async function getUser() {
  const response = await api.get('/user');
  return response.data.user;
}

export async function getProducts() {
  const response = await api.get('/products');
  return response.data.data;
}

export async function createProduct(product: {
  CategoryID: number;
  Name: string;
  Description: string | null;
  SKU: string | null;
  Price: number;
  Discount: number;
  StockQuantity: number;
  Images: Array<{ ImageURL: string; IsPrimary: boolean; SortOrder: number }>;
  Variants: Array<{
    AttributeValues: Array<{ AttributeID: number; Value: string }>;
    Price: number;
    Discount: number;
    StockQuantity: number;
    SKU: string;
  }>;
}) {
  const response = await api.post('/products', product);
  return response.data;
}

export async function updateProduct(
  productID: number,
  product: {
    CategoryID: number;
    Name: string;
    Description: string | null;
    SKU: string | null;
    Price: number;
    Discount: number;
    StockQuantity: number;
    Images: Array<{ ImageURL: string; IsPrimary: boolean; }>;
  }
) {
  const response = await api.put(`/products/${productID}`, product);
  return response.data;
}

export async function deleteProduct(productID: number) {
  const response = await api.delete(`/products/${productID}`);
  return response.data;
}

export async function getAttributes(categoryID: number): Promise<Attribute[]> {
  // try {
  //   const response = await api.get(`/attributes/${categoryID}`);
  //   return response.data || [];
  // } catch (error: any) {
  //   throw new Error(error.response?.data?.message || 'Failed to fetch attributes');
  // }
  const response = await api.get(`/attributes/${categoryID}`);
  return response.data ; 
}