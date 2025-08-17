import axios from "axios";
import Swal from "sweetalert2";
import { getAuthToken } from "./api";
import { API_URL } from "@/lib/config";

const api = axios.create({
  baseURL: API_URL, // Ensure this matches your Laravel API base URL
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
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
        title: "Unauthorized!",
        text: error.response?.data?.message || "You are not authorized to access this resource",
        icon: "error",
        draggable: true,
      }).then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        window.location.href = "/signin";
      });
    }
    return Promise.reject(error);
  }
);

export interface Attribute {
  AttributeID: number;
  Name: string;
}

export interface ProductData {
  ProductID: number;
  ShopID: number;
  Name: string;
  Description: string | null;
  CategoryID: number;
  Discount: number;
  AdminApprovalStatus: string;
  StockQuantity: number;
  images: { ImageID: number; ImageURL: string; IsPrimary: boolean; SortOrder: number }[];
  variants: {
    VariantID: number;
    Price: number;
    CompareAtPrice: number | null;
    StockQuantity: number;
    SKU: string;
    ImageURL: string | null;
    IsActive: boolean;
    attribute_values: { AttributeValueID: number; AttributeID: number; Value: string }[];
  }[];
  AttributeValues: { AttributeValueID: number; AttributeID: number; Value: string }[];
}

export async function getPlatformCategories() {
  const response = await api.get("/platform-categories");
  return response.data.data;
}

export async function getShopCategories() {
  const response = await api.get("/shop-categories");
  return response.data.data;
}

export async function registerCategory(categoryID: number) {
  const response = await api.post("/shop-categories", { CategoryID: categoryID });
  return response.data;
}

export async function deleteCategory(shopCategoryID: number) {
  const response = await api.delete(`/shop-categories/${shopCategoryID}`);
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await api.post("/login", { email, password });
  return response.data;
}

export async function getUser() {
  const response = await api.get("/user");
  return response.data.user;
}

export async function getProducts() {
  const response = await api.get("/products");
  return response.data.data;
}

export async function addProduct(productFormData: FormData): Promise<any> {
  const response = await api.post("shop/products", productFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}


export async function createProduct(productFormData: FormData): Promise<any> {
  console.log("Attempting to send request to /products...");
  console.log("Base URL is:", api.defaults.baseURL); // Kiểm tra baseURL
  console.log("--- Nội dung FormData ---");
  for (let [key, value] of productFormData.entries()) {
    console.log(key, value);
  }
  console.log("------------------------");
  try {
    const response = await api.post("/shop/products", productFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Request sent successfully!");
    return response.data;
  } catch (error) {
    console.error("Error inside createProduct service:", error); // Log lỗi chi tiết ở đây
    throw error; // Ném lỗi ra để component có thể bắt được
  }
}

export async function deleteProduct(productID: number) {
  const response = await api.delete(`/shop/products/${productID}`);
  return response.data;
}

export async function getAttributes(categoryID: number): Promise<Attribute[]> {
  const response = await api.get(`/attributes/${categoryID}`);
  return response.data; // Return raw data as per controller response
}

export async function getProduct(productID: number): Promise<ProductData> {
  try {
    const response = await api.get(`/shop/products/${productID}`);
    return response.data.data; // Expecting { data: ProductData } from controller
  } catch (error: any) {
    console.error("Error fetching product:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
}

export async function updateProduct(productID: number, productFormData: FormData): Promise<any> {
  console.log("Attempting to update product with ID:", productID);
  
  // THÊM DÒNG NÀY ĐỂ GIẢ LẬP PUT
  productFormData.append('_method', 'POST');

  console.log("--- Nội dung FormData (đã thêm _method) ---");
  for (let [key, value] of productFormData.entries()) {
    console.log(key, value);
  }
  console.log("------------------------");
  try {
    // DÙNG api.post ĐỂ GỬI ĐI
    const response = await api.post(`/shop/products/${productID}`, productFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Product updated successfully!");
    return response.data;
  } catch (error: any) {
    console.error("Error updating product:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update product");
  }
}

export async function getProductAttributeValues(productID: number): Promise<any> {
  try {
    const response = await api.get(`/products/${productID}/attribute-values`);
    return response.data.data; // Expecting { data: attributeValues } from controller
  } catch (error: any) {
    console.error("Error fetching product attribute values:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch attribute values");
  }
}
