import React from "react";
import type { Product } from "../types/product";
import { Link, useNavigate } from "react-router-dom";

type Props = {
    product: Product;
    onAddToCart?: (p: Product) => void;
};


const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
    const img =
    typeof product.image === "string"
      ? product.image
      : product.image?.[0] ?? "/src/assets/placeholder.png";

    const cardHighlight = product.newproduct ? "ring-2 ring-green-200" : "";

    return (
        <div className="h-full overflow-hidden rounded-md border border-gray-200 bg-white 
        shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col ">
      {/* Ảnh sản phẩm */}
      <Link to={`/products/${product.id}`} className="block overflow-hidden">
        <img
          src={img}
          alt={product.name}
          className="w-full h-[300px] object-cover transform hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
      </Link>

      {/* Nội dung sản phẩm */}
  <div className={`p-4 flex flex-col justify-between flex-1 ${cardHighlight}`}>
        <div>
          <Link
            to={`/products/${product.id}`}
            className="block text-sm font-semibold text-gray-900 text-center min-h-[42px] hover:text-blue-600 transition-colors"
          >
            {product.name}
          </Link>

          <div className="text-sm text-gray-700 font-medium mb-3 text-center">
            <p>{product.price.toLocaleString()},000 VND</p>
          </div>
        </div>

        {/* Nút và nhãn */}
        <div className="flex items-center justify-center gap-2 mt-auto">
          <button
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={() => {
              // On listing pages we navigate to the product detail so user can choose size/qty.
              // If a parent explicitly provided onAddToCart (legacy), still call it.
              if (onAddToCart) {
                onAddToCart(product);
                return;
              }
              navigate(`/products/${product.id}`);
            }}
          >
            Add to cart
          </button>

          {product.bestseller && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md font-medium">
              Bestseller
            </span>
          )}

          {product.newproduct && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-medium">
              New
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
