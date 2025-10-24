import React, { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
  } = useCartStore();

  // State quản lý modal
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => () => {});
  const [modalMessage, setModalMessage] = useState("");

  const openConfirm = (message: string, action: () => void) => {
    setModalMessage(message);
    setPendingAction(() => action);
    setShowModal(true);
  };

  const confirmAction = () => {
    pendingAction();
    setShowModal(false);
  };

  const cancelAction = () => setShowModal(false);

  const handleDecrease = (id: number, size?: string | null) => {
    const item = cart.find(
      (p) => p.id === id && (p.size ?? null) === (size ?? null)
    );
    if (item && item.quantity <= 1) {
      openConfirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?", () => {
        removeFromCart(id, size);
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
      });
    } else {
      decreaseQuantity(id, size);
    }
  };

  const handleRemove = (id: number, size?: string | null) => {
    openConfirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?", () => {
      removeFromCart(id, size);
      toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
    });
  };

  const handleClearCart = () => {
    openConfirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?", () => {
      clearCart();
      toast.success("Đã xóa toàn bộ giỏ hàng");
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Giỏ hàng của bạn</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link
            to="/"
            className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Tiếp tục mua sắm
          </Link>
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
