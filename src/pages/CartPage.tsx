// src/pages/CartPage.tsx
import React from "react";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemove = (id: number, size: string | null, name: string) => {
    removeFromCart(id, size);
    toast.success(`${name} (${size ?? "No size"}) đã được xóa khỏi giỏ hàng`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Giỏ hàng của bạn</h2>

      {cart.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Giỏ hàng trống.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white shadow-sm rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Sản phẩm</h3>
              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4 sm:gap-6"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 object-cover rounded-md border"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.size && (
                            <p className="text-sm text-gray-500 mt-1">
                              Size:{" "}
                              <span className="font-medium">{item.size}</span>
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {item.price.toLocaleString()}.000đ
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleRemove(item.id, item.size ?? null, item.name)
                          }
                          className="text-red-500 text-sm hover:underline"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Quantity input */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1),
                                item.size ?? null
                              )
                            }
                            className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              updateQuantity(
                                item.id,
                                Math.max(1, value || 1),
                                item.size ?? null
                              );
                            }}
                            className="w-16 text-center outline-none border-x py-1
                            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.size ?? null
                              )
                            }
                            className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-gray-600 text-sm">sản phẩm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow-sm rounded-md p-4 sticky top-4">
              <h3 className="font-medium text-lg mb-3">Tổng kết</h3>
              <div className="flex justify-between text-gray-700 mb-4">
                <span>Tổng tiền:</span>
                <span className="font-semibold text-indigo-600">
                  {total.toLocaleString()}.000đ
                </span>
              </div>
              <button
                onClick={clearCart}
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
