import React from "react";
import ProductList from "../components/ProductList";
import type { Product } from "../types/product";
import { useThemeStore } from "../store/themeStore";

import { useEffect, useState } from "react";
import bannerImg from "../assets/Banner.jpg";
import heroImg from "../assets/hero_img.png";

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useThemeStore();

  const slides = [bannerImg, heroImg];
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideIntervalMs = 4000;
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => { if (!isPaused) setCurrent(c => (c + 1) % slides.length); }, slideIntervalMs);
    return () => clearInterval(t);
  }, [isPaused, slides.length]);
  const prevSlide = () => { setCurrent(c => (c - 1 + slides.length) % slides.length); setIsPaused(true); setTimeout(() => setIsPaused(false), 3000); };
  const nextSlide = () => { setCurrent(c => (c + 1) % slides.length); setIsPaused(true); setTimeout(() => setIsPaused(false), 3000); };


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
        <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center overflow-hidden">
          {slides.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`slide-${idx}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none'}`}
            />
          ))}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <button onClick={prevSlide} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/70 p-2 shadow-md">‹</button>
          <button onClick={nextSlide} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/70 p-2 shadow-md">›</button>
        </section>

        <div className="product-grid-container">
          <ProductList products={products} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
