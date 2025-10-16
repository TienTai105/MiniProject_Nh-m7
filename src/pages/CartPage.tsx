import React from "react";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";

const CartPage: React.FC = () => {
    const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateQuantity } = useCartStore();

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleIncrease = (id: number, size: string | null, name: string) => {
        increaseQuantity(id, size);
        toast.info(`Đã tăng số lượng: ${name} (${size ?? 'No size'})`);
    };

    const handleDecrease = (id: number, size: string | null, name: string) => {
        decreaseQuantity(id, size);
        toast.info(`Đã giảm số lượng: ${name} (${size ?? 'No size'})`);
    };

    const handleRemove = (id: number, size: string | null, name: string) => {
        removeFromCart(id, size);
        toast.success(`${name} (${size ?? 'No size'}) đã được xóa khỏi giỏ hàng`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold mb-6">Giỏ hàng của bạn</h2>

            {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-500">Giỏ hàng trống.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: items */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white shadow-sm rounded-md p-4">
                            <h3 className="font-medium text-lg mb-2">Sản phẩm</h3>
                            <div className="divide-y">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-4">
                                        <img src={item.image} alt={item.name} className="h-24 w-24 object-cover rounded-md border" />

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    {item.size && <p className="text-sm text-gray-500 mt-1">Size: <span className="font-medium">{item.size}</span></p>}
                                                    <p className="text-sm text-gray-500 mt-1">{item.price.toLocaleString()}.000đ</p>
                                                </div>

                                                <button onClick={() => handleRemove(item.id, item.size ?? null, item.name)} className="text-red-500 text-sm">Xóa</button>
                                            </div>

                                            <div className="mt-3 flex items-center gap-4">
                                                <div className="flex items-center border rounded overflow-hidden bg-gray-50">
                                                    <button onClick={() => handleDecrease(item.id, item.size ?? null, item.name)} className="px-3 py-1 text-lg">−</button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        min={1}
                                                        onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value) || 1), item.size ?? null)}
                                                        className="w-14 text-center bg-transparent outline-none"
                                                    />
                                                    <button onClick={() => handleIncrease(item.id, item.size ?? null, item.name)} className="px-3 py-1 text-lg">+</button>
                                                </div>

                                                <div className="text-sm text-gray-600">Subtotal: <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}.000đ</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: summary (sticky on large screens) */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-20 bg-white shadow-sm rounded-md p-4">
                            <h3 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">{total.toLocaleString()}.000đ</span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium">—</span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Thuế (ước tính)</span>
                                    <span className="font-medium">—</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Tổng</span>
                                    <span>{total.toLocaleString()}.000đ</span>
                                </div>
                            </div>

                            <button className="w-full bg-blue-600 text-white py-3 rounded mb-3">Tiến hành thanh toán</button>

                            <button onClick={() => { clearCart(); toast.info('Giỏ hàng đã được làm trống'); }} className="w-full border rounded py-2 text-red-600">Xóa toàn bộ</button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default CartPage;
