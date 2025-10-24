import React, { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const CartPage: React.FC = () => {
    const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateQuantity } = useCartStore();

    // Tính toán tổng tiền
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = cart.length > 0 ? 30 : 0; // Phí ship cố định 30.000 VND
    const grandTotal = total + shippingFee;

    const handleRemove = (id: number, size: string | null, name: string) => {
        removeFromCart(id, size);
        toast.info(`Đã xóa ${name} khỏi giỏ hàng`, {
            autoClose: 1500,
        });
    };

    const handleIncrease = (id: number, size: string | null, name: string) => {
        increaseQuantity(id, size);
        toast.info(`Đã tăng số lượng: ${name} (${size ?? 'No size'})`);
    };

    const handleDecrease = (id: number, size: string | null, name: string) => {
        decreaseQuantity(id, size);
        toast.info(`Đã giảm số lượng: ${name} (${size ?? 'No size'})`);
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?")) {
            clearCart();
            toast.success("Đã xóa toàn bộ sản phẩm, giỏ hàng trống!", {
                autoClose: 1500,
            });
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
                                src="/empty-cart.png"
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
                                                    {(item.price * item.quantity).toLocaleString()}.000 VND
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
                                            <div className="flex items-center border rounded overflow-hidden bg-gray-50">
                                                <button
                                                    onClick={() => handleDecrease(item.id, item.size ?? null, item.name)}
                                                    className="px-3 py-1 text-lg hover:bg-gray-100"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    min={1}
                                                    onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value) || 1), item.size ?? null)}
                                                    className="w-14 text-center bg-transparent outline-none"
                                                />
                                                <button
                                                    onClick={() => handleIncrease(item.id, item.size ?? null, item.name)}
                                                    className="px-3 py-1 text-lg hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
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
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 lg:sticky lg:top-20">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800">Tóm tắt đơn hàng</h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tạm tính</span>
                            <span className="font-medium text-gray-800">{total.toLocaleString()}.000 VND</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phí vận chuyển</span>
                            <span className="font-medium text-gray-800">
                                {cart.length > 0 ? shippingFee.toLocaleString() : "0"}.000 VND
                            </span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-base font-semibold">
                            <span>Tổng cộng</span>
                            <span className="text-blue-600">{grandTotal.toLocaleString()}.000 VND</span>
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
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Giá</th>
                  <th className="p-3">Số lượng</th>
                  <th className="p-3">Tổng</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id + (item.size ?? "")} className="border-b hover:bg-gray-50 transition">
                    {/* Hình ảnh + tên */}
                    <td className="p-3 flex items-center gap-4">
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border bg-white flex justify-center items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.size && (
                          <p className="text-sm text-gray-500">Size: {item.size}</p>
                        )}
                      </div>
                    </td>

                    {/* Giá */}
                    <td className="p-3 text-gray-700">
                      {item.price.toLocaleString()},000₫
                    </td>

                    {/* Số lượng */}
                    <td className="p-3">
                      <div className="flex items-center border rounded-md w-fit">
                        <button
                          onClick={() => handleDecrease(item.id, item.size ?? null)}
                          className="px-3 py-1 text-lg"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            setQuantity(
                              item.id,
                              item.size ?? null,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-12 text-center outline-none border-x appearance-none no-spinner"
                        />
                        <button
                          onClick={() => increaseQuantity(item.id, item.size ?? null)}
                          className="px-3 py-1 text-lg"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Tổng */}
                    <td className="p-3 text-gray-800 font-medium">
                      {(item.price * item.quantity).toLocaleString()},000₫
                    </td>

                    {/* Nút xóa */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemove(item.id, item.size ?? null)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng tiền */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleClearCart}
              className="px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Xóa toàn bộ giỏ hàng
            </button>

            <div className="text-right">
              <p className="text-lg font-semibold">
                Tổng cộng: {total.toLocaleString()},000₫
              </p>
              <button className="mt-3 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                Thanh toán
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal xác nhận */}
      <ConfirmModal
        show={showModal}
        message={modalMessage}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />
    </div>
  );
};

export default CartPage;