import React, { useEffect, useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emptyAddress = () => ({
  id: makeId(),
  label: "Nhà",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Vietnam",
});

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const total = subtotal; 

  const [fullname, setFullname] = useState<string>(user?.name || user?.username || user?.email || "");
  const [phone, setPhone] = useState<string>("");
  const [addresses, setAddresses] = useState<any[]>([emptyAddress()]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<number>(0);

  useEffect(() => {
    if (user) {
      try {
        const usersRaw = localStorage.getItem("users") || "[]";
        const users = JSON.parse(usersRaw);
        const me = users.find((u: any) => (u.email || "").toLowerCase() === (user.email || "").toLowerCase() || (u.username || "").toLowerCase() === (user.username || "").toLowerCase());
        if (me) {
          if (me.phone) setPhone(me.phone);
          if (me.addresses && Array.isArray(me.addresses) && me.addresses.length > 0) {
            setAddresses(me.addresses.map((a: any) => ({ ...emptyAddress(), ...a })));
            setSelectedAddressIdx(0);
          }
        }
      } catch (err) {
      }
    }
  }, [user]);

  const updateAddressField = (index: number, key: string, value: string) => {
    setAddresses((prev) => {
      const nxt = prev.slice();
      nxt[index] = { ...(nxt[index] || emptyAddress()), [key]: value };
      return nxt;
    });
  };

  const addAddress = () => setAddresses((p) => [...p, emptyAddress()]);
  const removeAddress = (index: number) => {
    setAddresses((p) => {
      const nxt = p.slice();
      nxt.splice(index, 1);
      return nxt.length ? nxt : [emptyAddress()];
    });
    setSelectedAddressIdx((prev) => Math.max(0, Math.min(prev, addresses.length - 2)));
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast.info("Giỏ hàng rỗng. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }
    if (!user) {
      toast.info("Vui lòng đăng nhập để đặt hàng.");
      navigate("/login");
      return;
    }
    if (!fullname.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }
    const shippingAddr = addresses[selectedAddressIdx] || addresses[0] || emptyAddress();
    if (!shippingAddr.street || !shippingAddr.city) {
      if (!window.confirm("Địa chỉ giao hàng có vẻ chưa đầy đủ. Bạn có muốn tiếp tục?")) return;
    }

    const raw = localStorage.getItem("orders");
    const orders = raw ? JSON.parse(raw) : [];

    const newOrder = {
      id: makeId(),
      user: {
        id: user.id || null,
        name: fullname,
        email: user.email || user.username || "",
        phone: phone,
        addresses: addresses.map((a: any) => ({ ...a })), 
        shippingAddressId: shippingAddr.id || null,
      },
      items: cart.map((it: any) => ({
        id: it.id,
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        size: it.size || null,
        image: it.image || null,
      })),
      subtotal,
      total,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    try {
      const usersRaw = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersRaw);
      const idx = users.findIndex((u: any) => (u.email || "").toLowerCase() === (user.email || "").toLowerCase() || (u.username || "").toLowerCase() === (user.username || "").toLowerCase());
      if (idx >= 0) {
        users[idx].phone = phone;
        users[idx].addresses = addresses.map((a: any) => ({ ...a }));
        localStorage.setItem("users", JSON.stringify(users));
      }
    } catch (err) {
    }

    clearCart();
    toast.success("Đặt hàng thành công!");
    window.dispatchEvent(new StorageEvent("storage", { key: "orders", newValue: JSON.stringify(orders) }));
    navigate("/profile-orders");
  };

  if (cart.length === 0)
    return <div className="p-6">Giỏ hàng rỗng. Vui lòng thêm sản phẩm trước khi thanh toán.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>

      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Họ và tên</label>
            <input value={fullname} onChange={(e) => setFullname(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm block mb-1">Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Địa chỉ giao hàng</h4>
            <button type="button" onClick={addAddress} className="text-sm text-blue-600">Thêm địa chỉ</button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr, idx) => (
              <div key={addr.id || idx} className="border p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" checked={selectedAddressIdx === idx} onChange={() => setSelectedAddressIdx(idx)} />
                    <span className="font-medium">{addr.label || `Địa chỉ ${idx + 1}`}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => removeAddress(idx)} className="text-red-600 text-sm">Xoá</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input placeholder="Nhãn (Ví dụ: Nhà, Cơ quan)" value={addr.label} onChange={(e) => updateAddressField(idx, "label", e.target.value)} className="border px-2 py-2 rounded" />
                  <input placeholder="Quốc gia" value={addr.country} onChange={(e) => updateAddressField(idx, "country", e.target.value)} className="border px-2 py-2 rounded" />
                  <input placeholder="Địa chỉ (số, đường)" value={addr.street} onChange={(e) => updateAddressField(idx, "street", e.target.value)} className="border px-2 py-2 rounded md:col-span-2" />
                  <input placeholder="Thành phố" value={addr.city} onChange={(e) => updateAddressField(idx, "city", e.target.value)} className="border px-2 py-2 rounded" />
                  <input placeholder="Tỉnh/Quận" value={addr.state} onChange={(e) => updateAddressField(idx, "state", e.target.value)} className="border px-2 py-2 rounded" />
                  <input placeholder="Mã bưu chính" value={addr.postalCode} onChange={(e) => updateAddressField(idx, "postalCode", e.target.value)} className="border px-2 py-2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Xác nhận đơn hàng</h3>
      <div className="border rounded p-4 mb-4 bg-white">
        {cart.map((it: any) => (
          <div key={`${it.id}-${it.size ?? "nosz"}`} className="flex items-center gap-4 py-2 border-b last:border-b-0">
            <img src={it.image} className="w-20 h-20 object-cover rounded" alt={it.name} />
            <div className="flex-1">
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">Số lượng: {it.quantity} {it.size ? `- ${it.size}` : ""}</div>
            </div>
            <div className="font-semibold">{((it.price || 0) * (it.quantity || 0)).toLocaleString('vi-VN')}.000 VND</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold">Tổng: {total.toLocaleString('vi-VN')}.000 VND</div>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Quay lại</button>
          <button onClick={placeOrder} className="bg-green-600 text-white px-4 py-2 rounded">Đặt hàng</button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
