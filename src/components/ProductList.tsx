import React from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../types/product";

type Props = {
    products: Product[];
    onAddToCart?: (p: Product) => void;
};

const ProductList: React.FC<Props> = ({ products, onAddToCart }) => {
    if (!products || products.length === 0) return <div>Không có sản phẩm</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-5 gap-6">
                {products.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
                ))}
            </div>
        </div>

    );
};

export default ProductList;
