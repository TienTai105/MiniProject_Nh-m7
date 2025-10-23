import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";
import { motion } from "framer-motion"; 
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProducts, setNewProducts] = useState<Product[]>([]); // ✅ sản phẩm mới

  const [mainIndex, setMainIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState<number | string>(1);
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

  const standardSizes = ["S", "M", "L", "XL", "XXL"];
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
    fetch("https://68ef2e22b06cc802829c5e18.mockapi.io/api/products")
      .then((res) => res.json())
      .then((data) => {
        const latest = data.slice(-6).reverse(); 
        setNewProducts(latest);
      })
      .catch((err) => console.error(err));
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
          ← Quay lại
        </button>
        <div>Sản phẩm không tìm thấy</div>
      </div>
    );

  const displayPrice = product.price;
  const formattedDate = new Date(product.date).toLocaleDateString();

  const handleAddToCart = () => {
    if (sizesArray.length > 0 && !selectedSize) {
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
      size: selectedSize || null,
    });

    toast.success("Đã thêm vào giỏ hàng");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-blue-600 cursor-pointer"
      >
        ← Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="h-[520px] w-full bg-gray-100 flex items-center justify-center aspect-[3/4] duration-300 rounded-md overflow-hidden">
            <img
              src={product.image?.[mainIndex]}
              alt={`${product.name}-${mainIndex}`}
              className="w-full h-full object-contain bg-white"
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
              {displayPrice.toLocaleString()},000 ₫
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Cập nhật: {formattedDate}
            </div>
          </div>

          <p className="mt-6 whitespace-pre-line text-gray-700">
            {product.description}
          </p>

          <div className="mt-6">
            <div className="text-sm mb-2">Size</div>
            <div className="flex flex-wrap gap-2">
              {sizesToShow.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1 border rounded-md text-sm ${selectedSize === s
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
                Đã chọn: <strong>{selectedSize}</strong>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() =>
                  setQty((q) =>
                    typeof q === "number" ? Math.max(1, q - 1) : 1
                  )
                }
                className="px-3 py-2 text-lg font-medium"
              >
                −
              </button>

              <input
                type="number"
                value={qty}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[0-9]*$/.test(val)) {
                    setQty(val === "" ? "" : Number(val));
                  }
                }}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (!val || val < 1) setQty(1);
                }}
                className="w-16 text-center outline-none bg-transparent
                [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <button
                onClick={() =>
                  setQty((q) => (typeof q === "number" ? q + 1 : 1))
                }
                className="px-3 py-2 text-lg font-medium"
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

<section className="mt-16">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
    Sản phẩm mới
  </h2>

  <Swiper
    modules={[Navigation, Pagination, Autoplay]}
    spaceBetween={20}
    slidesPerView={5}
    navigation
    pagination={{ clickable: true }}
    autoplay={{ delay: 3000 }}
    breakpoints={{
      320: { slidesPerView: 1 },
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 5 },
    }}
    className="pb-10"
  >
    {newProducts
      .filter((item) => item.newproduct) // 🟩 chỉ lấy sản phẩm mới
      .map((item, idx) => (
        <SwiperSlide key={item.id}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            <div
              onClick={() => navigate(`/products/${item.id}`)}
              className="block overflow-hidden cursor-pointer"
            >
              <img
                src={Array.isArray(item.image) ? item.image[0] : item.image}
                alt={item.name}
                className="w-full h-[260px] object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-4 flex flex-col justify-between flex-1">
              <h3
                onClick={() => navigate(`/products/${item.id}`)}
                className="block text-sm font-semibold text-gray-900 text-center min-h-[42px] hover:text-blue-600 transition-colors cursor-pointer"
              >
                {item.name}
              </h3>

              <div className="text-sm text-gray-700 font-medium mb-3 text-center">
                <p>{item.price.toLocaleString()},000 VND</p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-auto">
                <button
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm cursor-pointer hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    addToCartStore({
                      id: Number(item.id),
                      name: item.name,
                      price: item.price,
                      image: Array.isArray(item.image) ? item.image[0] : item.image,
                      quantity: 1,
                      size: null,
                    });
                    toast.success("Đã thêm vào giỏ hàng");
                  }}
                >
                  Add to cart
                </button>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-medium">
                  New
                </span>
              </div>
            </div>
          </motion.div>
        </SwiperSlide>
      ))}
  </Swiper>
</section>


    </div>
  );
};

export default ProductDetail;
