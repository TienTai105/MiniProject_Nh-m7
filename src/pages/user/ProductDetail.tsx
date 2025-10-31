import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../types/product";
import { useCartStore } from "../../store/cartStore";
import { toast } from "react-toastify";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mainIndex, setMainIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState<number | string>(1);
  const prevQtyRef = useRef<number | string>(qty);
  const relatedRef = useRef<HTMLDivElement | null>(null);
  const addToCartStore = useCartStore((s) => s.addToCart);

  // Xử lý sizes
  const sizesArray: string[] = React.useMemo(() => {
    if (!product) return [];
    const sizesRaw: any = (product as any).sizes;
    if (Array.isArray(sizesRaw)) return sizesRaw;
    if (typeof sizesRaw === "string")
      return (sizesRaw as string)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    return [];
  }, [product]);

  const standardSizes = React.useMemo(() => ["S", "M", "L", "XL", "XXL"], []);
  const sizesToShow = sizesArray.length > 0 ? sizesArray : standardSizes;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://68ef2e22b06cc802829c5e18.mockapi.io/api/products/${id}`
        );
        if (!res.ok) throw new Error("Không thể tải sản phẩm");
        const data: Product = await res.json();
        setProduct(data);

        const relatedRes = await fetch(
          `https://68ef2e22b06cc802829c5e18.mockapi.io/api/products`
        );
        const allProducts: Product[] = await relatedRes.json();
        // Prefer showing bestsellers. If none are marked, fallback to same category items.
        const bestsellers = allProducts.filter((p) => p.bestseller && p.id !== data.id).slice(0, 8);
        if (bestsellers.length > 0) {
          setRelatedProducts(bestsellers);
        } else {
          const sameCategory = allProducts.filter((p) => p.category === data.category && p.id !== data.id).slice(0, 8);
          setRelatedProducts(sameCategory);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    // previously fetched latest products into `newProducts` state; removed to avoid unused variable
    // keep this effect empty or use for analytics if needed in future
    return;
  }, []);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-600">
        Đang tải sản phẩm...
      </div>
    );

  if (error || !product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-blue-600 cursor-pointer"
        >
          ← Back
        </button>
        <div>Sản phẩm không tìm thấy</div>
      </div>
    );


  const displayPrice = product.price;
  const formattedDate =
    typeof product.date === "number"
      ? new Date(product.date).toLocaleDateString()
      : new Date(product.date).toLocaleDateString();
  const handleAddToCart = () => {
    // Bắt buộc chọn size trước khi thêm vào giỏ
    if (!selectedSize) {
      toast.error("Vui lòng chọn size trước khi thêm vào giỏ");
      return;
    }

    const idNum = Number(product.id) || Date.now();
    const img = Array.isArray(product.image) ? product.image[0] ?? "" : product.image ?? "";
    const quantity = typeof qty === "number" ? qty : Number(qty) || 1;

    addToCartStore({
      id: idNum,
      name: product.name,
      price: product.price,
      image: img,
      quantity,
      size: selectedSize,
    });

    toast.success("Đã thêm vào giỏ hàng");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-blue-600 cursor-pointer"
      >
        ← Back
      </button>

      {/* ---------- Phần chi tiết ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="h-[520px] w-full bg-gray-100 flex items-center justify-center aspect-[3/4] duration-300 rounded-md overflow-hidden">
            <img
              src={Array.isArray(product.image) ? product.image[mainIndex] : (product.image as any)}
              alt={`${product.name}-${mainIndex}`}
              className="object-cover w-full h-full transition-transform duration-300"
            />
          </div>

          {product.image && product.image.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.image.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`w-20 h-20 border rounded-md overflow-hidden ${idx === mainIndex ? "ring-2 ring-blue-500" : ""
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            {product.bestseller && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md">
                Bestseller
              </span>
            )}
          </div>

          <p className="text-gray-500 text-sm mt-2">
            {product.category} / {product.subCategory}
          </p>

          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              <p>{displayPrice.toLocaleString()},000 VND</p>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Update: {formattedDate}
            </div>
          </div>

          <p className="mt-6 text-gray-700 whitespace-pre-line">
            {product.description}
          </p>

          {/* Chọn size */}
          <div className="mt-6">
            <div className="text-sm mb-2">Size</div>
            <div className="flex flex-wrap gap-2">
              {sizesToShow.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    selectedSize === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizesToShow.length > 0 && selectedSize && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: <strong>{selectedSize}</strong>
              </div>
            )}
            {sizesArray.length === 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Sản phẩm không có size rõ ràng — bạn có thể chọn size chuẩn
                S/M/L/XL/XXL
              </div>
            )}
          </div>

          {/* Chọn số lượng + Add to cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQty((q) => Math.max(1, Number(q) - 1))}
                className="px-3 py-2"
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onFocus={() => {
                  prevQtyRef.current = qty;
                }}
                onChange={(e) => {
                  // allow free typing (including empty string)
                  setQty(e.currentTarget.value);
                }}
                onBlur={(e) => {
                  const v = String(e.currentTarget.value).trim();
                  if (v === "") {
                    // restore previous if user cleared and left
                    setQty(prevQtyRef.current);
                    return;
                  }
                  const n = Number(v);
                  if (isNaN(n) || n < 1) {
                    setQty(prevQtyRef.current);
                    return;
                  }
                  setQty(Math.max(1, n));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                min={1}
                className="w-16 text-center border-x outline-none appearance-none no-spinner"
              />
              <button
                onClick={() => setQty((q) => Number(q) + 1)}
                className="px-3 py-2"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Phần sản phẩm liên quan ---------- */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Sản phẩm liên quan</h2>
          </div>

          <div className="relative">
            {/* Left overlay button */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
              <button
                aria-label="Previous related"
                onClick={() => {
                  const el = relatedRef.current || document.getElementById('related-scroll');
                  if (el) (el as HTMLElement).scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Right overlay button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
              <button
                aria-label="Next related"
                onClick={() => {
                  const el = relatedRef.current || document.getElementById('related-scroll');
                  if (el) (el as HTMLElement).scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border hover:bg-gray-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div id="related-scroll" ref={relatedRef} className="flex gap-6 overflow-x-auto no-scrollbar py-2">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/products/${item.id}`)}
                  className="min-w-[200px] sm:min-w-[220px] md:min-w-[260px] cursor-pointer border rounded-lg p-3 hover:shadow-lg transition bg-white flex-shrink-0"
                >
                  <div className="w-full h-44 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={Array.isArray(item.image) ? item.image[0] : item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-800 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.price.toLocaleString()},000 VND
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
