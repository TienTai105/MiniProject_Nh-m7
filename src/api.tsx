import axios from "axios";
import type { Product } from "./types/product";

const BASE_URL = "https://68ef2e22b06cc802829c5e18.mockapi.io/api/products";

export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const addProduct = async (product: Product): Promise<Product> => {
  const res = await axios.post(BASE_URL, product);
  return res.data;
};

export const updateProduct = async (product: Product): Promise<Product> => {
  const res = await axios.put(`${BASE_URL}/${product.id}`, product);
  return res.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};
