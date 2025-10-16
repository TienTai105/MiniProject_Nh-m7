import React from "react";
import ProductList from "../components/ProductList";
import type { Product } from "../types/product";
import { useThemeStore } from "../store/themeStore";

import { useEffect, useState } from "react";

  const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://68ef2e22b06cc802829c5e18.mockapi.io/api/products");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải sản phẩm...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Lỗi: {error}</p>;
  if (!products || products.length === 0) return <div className="text-center mt-10">Không có sản phẩm</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold px-4 mt-6">HomePage</h1>
      <div className={`min-h-screen py-6 flex flex-col justify-center sm:py-12 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
        <div className="product-grid-container">
          <ProductList products={products} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
