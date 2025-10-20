import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductList from "../components/ProductList";
import type { Product } from "../types/product";
import { getProducts } from "../api";
import { useNavigate } from "react-router-dom";

const CollectionPage: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "bestseller" | "newproduct">("all");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });


  const filtered = useMemo(() => {
    if (!products) return [];
    if (filter === "bestseller") return products.filter((p) => p.bestseller);
    if (filter === "newproduct") return products.filter((p) => p.newproduct);
    return products;
  }, [products, filter]);


  const navigate = useNavigate();
  const handleNavigateToAdd = () => navigate("/add-product");


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bộ sưu tập sản phẩm</h2>
        <button
          onClick={handleNavigateToAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("bestseller")}
              className={`px-3 py-1 rounded ${filter === "bestseller" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Bestseller
            </button>
            <button
              onClick={() => setFilter("newproduct")}
              className={`px-3 py-1 rounded ${filter === "newproduct" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              New Product
            </button>
          </div>
          <div className="text-sm text-gray-600">{filtered.length} sản phẩm</div>
        </div>

        <section>
          {isLoading ? (
            <div>Đang tải sản phẩm...</div>
          ) : (
            <ProductList products={filtered as Product[]} />
          )}
        </section>
      </div>
    </div>
  );
};

export default CollectionPage;
