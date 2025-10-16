import React from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../types/product";
import { useProductStore } from "../store/productStore";

type Props = {
    products: Product[];
    onAddToCart?: (p: Product) => void;
};

const ProductList: React.FC<Props> = ({ products, onAddToCart }) => {
    const { searchQuery } = useProductStore();

    const filtered = React.useMemo(() => {
        if (!products || products.length === 0) return [];
        const q = (searchQuery || '').trim().toLowerCase();
        if (!q) return products;
        return products.filter(p => {
            return (
                p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.subCategory?.toLowerCase().includes(q)
            );
        });
    }, [products, searchQuery]);

    if (!filtered || filtered.length === 0) return <div className="px-4 py-8 text-center text-gray-500">Không có sản phẩm phù hợp.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-5 gap-6">
                {filtered.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
                ))}
            </div>
        </div>

    );
};

export default ProductList;
