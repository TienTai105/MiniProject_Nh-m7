import React from "react";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } =
    useCartStore();

 // Tổng tiền (price đã là nghìn đồng)
const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shippingFee = 30; // Phí ship cố định 30.000đ (Tài có thể đổi tuỳ ý)
const grandTotal = total + shippingFee;


  const handleRemove = (id: number, size: string | null, name: string) => {
    removeFromCart(id, size ?? undefined);
    toast.info(`Đã xóa ${name} khỏi giỏ hàng`);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?")) {
      clearCart();
      toast.success("Đã xóa toàn bộ sản phẩm");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-12 lg:gap-8">
      {/* LEFT */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xl text-gray-800">Giỏ hàng của bạn</h3>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-500 text-sm font-medium hover:text-red-600 transition"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-10">
              <img
                src="/public/empty-cart.png"
                alt="Empty cart"
                className="w-28 mx-auto mb-4 opacity-80"
              />
              <p className="text-gray-500 mb-3">Giỏ hàng của bạn đang trống.</p>
              <Link
                to="/"
                className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md hover:opacity-90 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size ?? "default"}`}
                  className="flex items-center gap-5 py-4 rounded-lg transition"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {item.size && (
                          <p className="text-sm text-gray-500 mt-1">
                            Size: <span className="font-medium">{item.size}</span>
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {item.price.toLocaleString()}.000đ
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id, item.size ?? null, item.name)}
                        className="text-red-400 hover:text-red-600 text-sm transition"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => decreaseQuantity(item.id, item.size ?? undefined)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-700"
                      >
                        -
                      </button>
                      <span className="text-gray-700 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id, item.size ?? undefined)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Tóm tắt đơn hàng</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium text-gray-800">{total.toLocaleString()}.000đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-medium text-gray-800">
                {cart.length > 0 ? shippingFee.toLocaleString() : "0"}.000đ
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-base font-semibold">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{grandTotal.toLocaleString()}.000đ</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className={`block text-center mt-5 px-4 py-3 rounded-lg font-medium shadow-md transition ${
              cart.length > 0
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
