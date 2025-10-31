import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

const ProfileOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const loadOrdersForUser = () => {
    try {
      const raw = localStorage.getItem("orders") || "[]";
      const arr = JSON.parse(raw);
      if (!user) {
        setOrders([]);
        return;
      }
      const filtered = arr.filter((o: any) => {
        if (!o.user) return false;
        if (user.id && o.user.id) return String(o.user.id) === String(user.id);
        return (o.user.email || "").toLowerCase() === (user.email || "").toLowerCase();
      });
      setOrders(filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Load orders error", err);
      setOrders([]);
    }
  };

  const deleteOrder = (orderId: string) => {
    try {
      const raw = localStorage.getItem("orders") || "[]";
      const arr = JSON.parse(raw);

      const target = arr.find((o: any) => o.id === orderId);
      if (target && (target.status === "Shipped" || target.status === "Delivered")) {
        alert("Không thể xóa đơn hàng đã được giao hoặc đang vận chuyển!");
        setPendingDelete(null);
        return;
      }

      const filtered = arr.filter((o: any) => o.id !== orderId);
      localStorage.setItem("orders", JSON.stringify(filtered));
      loadOrdersForUser();
      setPendingDelete(null);
      toast.success("Đã xóa đơn hàng");
    } catch (err) {
      console.error("Delete order error", err);
      setPendingDelete(null);
      toast.error("Xóa đơn hàng thất bại");
    }
  };

  useEffect(() => {
    loadOrdersForUser();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "orders") loadOrdersForUser();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user]);

  // the currently selected order for modal confirmation
  const targetOrder = pendingDelete ? orders.find((x) => x.id === pendingDelete) : null;

  if (!user) return <div className="p-6">Vui lòng đăng nhập</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đơn hàng của {user.name || user.email}</h2>

      {orders.length === 0 && <div className="text-gray-500">Chưa có đơn hàng</div>}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border rounded p-3">
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <div className="font-semibold">Đơn: {o.id}</div>
                <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</div>
                {Array.isArray(o.statusHistory) && o.statusHistory.length > 0 && (
                  <div className="text-xs text-gray-400">{new Date(o.statusHistory[o.statusHistory.length - 1].at).toLocaleString()}</div>
                )}
              </div>
              <div className="mt-2 sm:mt-0 text-right">
                <div className="text-sm">Tổng: <span className="font-semibold">{(o.total || o.subtotal || 0).toLocaleString('vi-VN')}.000 VND</span></div>
                <div className="text-sm">Trạng thái: <span className="font-medium">{o.status}</span></div>
                {o.status !== "Shipped" && o.status !== "Delivered" && (
                  <button
                    onClick={() => setPendingDelete(o.id)}
                    className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  >
                    Xóa đơn hàng
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="text-sm font-medium mb-2">Sản phẩm</div>
              <div className="space-y-2">
                {o.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img src={it.image || "/no-image.png"} alt={it.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.size ? `Size: ${it.size}` : ""} • x{it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-medium">{((it.price || 0) * (it.quantity || 1)).toLocaleString('vi-VN')}.000 VND</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal confirm for delete */}
      {pendingDelete && targetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setPendingDelete(null)} />
          <div className="relative bg-white rounded shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa đơn hàng</h3>
            <p className="text-sm text-gray-700 mb-4">Bạn chắc chắn muốn xóa đơn <span className="font-medium">{targetOrder.id}</span> ?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteOrder(pendingDelete)}
                className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOrdersPage;
