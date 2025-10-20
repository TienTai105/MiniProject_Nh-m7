// src/pages/ProductDetail.tsx
import React, { useEffect , useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";


const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mainIndex, setMainIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState<number>(1);
  const addToCartStore = useCartStore((s) => s.addToCart);
  
  // derive sizes array once
  const sizesArray: string[] = React.useMemo(() => {
    if (!product) return [];
    const sizesRaw: any = (product as any).sizes;
    if (Array.isArray(sizesRaw)) return sizesRaw;
    if (typeof sizesRaw === "string") return (sizesRaw as string).split(",").map((s: string) => s.trim()).filter(Boolean);
    return [];
  }, [product]);
  // fallback standard sizes when product doesn't specify sizes
  const standardSizes = React.useMemo(() => ["S", "M", "L", "XL", "XXL"], []);
  const sizesToShow = sizesArray.length > 0 ? sizesArray : standardSizes;

    useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log("Fetching product id:", id); // debug
        const res = await fetch(`https://68ef2e22b06cc802829c5e18.mockapi.io/api/products/${id}`);
        if (!res.ok) throw new Error("Không thể tải sản phẩm");
        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-600">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-blue-600 cursor-pointer">← Back</button>
        <div>Sản phẩm không tìm thấy</div>
      </div>
    );
  }
  const displayPrice = product.price; 

  const formattedDate =
    typeof product.date === "number"
      ? new Date(product.date).toLocaleDateString()
      : new Date(product.date).toLocaleDateString();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-blue-600 cursor-pointer">← Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: ảnh chính */}
        <div>
          <div className="h-[520px] w-full bg-gray-100 flex items-center justify-center aspect-[3/4] hover:shadow-lg transition-shadow duration-300">
            <img
              src={product.image?.[mainIndex]}
              alt={`${product.name}-${mainIndex}`}
              className="object-cover w-auto h-full transition-transform duration-300 "
            />
          </div>

          {product.image && product.image.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.image.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`w-20 h-20 border rounded-md overflow-hidden ${
                    idx === mainIndex ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <img src={img} alt={`${product.name}-thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: thông tin sản phẩm */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold ">{product.name}</h1>
            {product.bestseller && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md">Bestseller</span>
            )}
          </div>

          <p className="text-gray-500 text-sm mt-2">{product.category} / {product.subCategory}</p>

          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 ">
              <p>{displayPrice.toLocaleString()},000 VND</p>
            </div>
            <div className="text-sm text-gray-500 mt-1">Update: {formattedDate}</div>
          </div>

          <p className="mt-6 text-gray-700 whitespace-pre-line">{product.description}</p>

          <div className="mt-6">
            <div className="text-sm text-gray-600 mb-2">Size</div>
            <div className="flex flex-wrap gap-2">
              {sizesToShow.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    selectedSize === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizesToShow.length > 0 && selectedSize && <div className="mt-2 text-sm text-gray-600">Selected: <strong>{selectedSize}</strong></div>}
            {sizesArray.length === 0 && (
              <div className="mt-2 text-xs text-gray-500">Sản phẩm không có size rõ ràng — bạn có thể chọn size chuẩn S/M/L/XL/XXL</div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2"
                aria-label="- quantity"
              >
                -
              </button>
              <div className="px-4">{qty}</div>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2"
                aria-label="+ quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                if (sizesArray.length > 0 && !selectedSize) {
                  toast.error('Vui lòng chọn size trước khi thêm vào giỏ');
                  return;
                }

                const idNum = Number(product.id) || Date.now();
                const img = Array.isArray(product.image) ? product.image[0] || "" : product.image || "";

            addToCartStore({ id: idNum, name: product.name, price: product.price, image: img, quantity: qty, size: selectedSize || null });
                toast.success('Đã thêm vào giỏ hàng');
                // Optionally navigate to cart or keep user on detail page
                // navigate('/cart');
              }}
              className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
