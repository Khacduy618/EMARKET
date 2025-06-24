import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
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



export async function createProduct(productFormData: FormData): Promise<any> {
  console.log("Attempting to send request to /products...");
  console.log("Base URL is:", api.defaults.baseURL); // Kiểm tra baseURL
  // Sau khi tạo productFormData và append xong
  console.log("--- Nội dung FormData ---");
  for (let [key, value] of productFormData.entries()) {
    console.log(key, value);
  }
  console.log("------------------------");
  try {
    const response = await api.post('/shop/products', productFormData, {
      // --- PHẦN SỬA QUAN TRỌNG NHẤT ---
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // ---------------------------------
    });
    console.log("Request sent successfully!");
    return response.data;
  } catch (error) {
    console.error("Error inside createProduct service:", error); // Log lỗi chi tiết ở đây
    throw error; // Ném lỗi ra để component có thể bắt được
  }
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

// Trong file services/seller-category.ts

// ... (các hàm đã có như createProduct, getProducts...)

/**

/**
 * Lấy thông tin chi tiết của một sản phẩm để chỉnh sửa.
 * @param {number} productID - ID của sản phẩm cần lấy.
 * @returns {Promise<any>} Dữ liệu chi tiết của sản phẩm.
 */
export async function getProductDetails(productID: number): Promise<any> {
  const response = await api.get(`/shop/products/${productID}`);
  return response.data.data;
}

/**
 * Cập nhật thông tin một sản phẩm.
 * @param {number} productID - ID của sản phẩm cần cập nhật.
 * @param {FormData} productFormData - FormData chứa dữ liệu cập nhật.
 * @returns {Promise<any>}
 */
export async function updateProduct(productID: number, productFormData: FormData): Promise<any> {
  // Dùng POST để gửi FormData, nhưng thêm _method để Laravel hiểu là PUT
  productFormData.append('_method', 'POST');

  const response = await api.post(`/shop/products/${productID}`, productFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },  
  });
  return response.data;
}

export async function getProductAttributeValues(productID: number): Promise<any> {
  const response = await api.get(`/shop/products/${productID}/attribute-values`);
  return response.data.data;
}