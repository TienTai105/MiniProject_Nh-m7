import React, { useEffect, useState, useRef } from "react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
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

  // payment states
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "momo">("cod");
  const [showQrModal, setShowQrModal] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownRef = useRef<number | null>(null);
  const autoConfirmTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      try {
        const usersRaw = localStorage.getItem("users") || "[]";
        const users = JSON.parse(usersRaw);
        const me = users.find((u: any) =>
          ((u.email || "").toLowerCase() === (user.email || "").toLowerCase()) ||
          ((u.username || "").toLowerCase() === (user.username || "").toLowerCase())
        );
        if (me) {
          if (me.phone) setPhone(me.phone);
          if (me.addresses && Array.isArray(me.addresses) && me.addresses.length > 0) {
            setAddresses(me.addresses.map((a: any) => ({ ...emptyAddress(), ...a })));
            setSelectedAddressIdx(0);
          }
        }
      } catch (err) {
        // ignore
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

  // --- core: finalize order (used for both COD and successful momo) ---
  const finalizeOrder = (opts: { paymentMethod: string; paymentStatus: "Pending" | "Paid" | "Failed" }) => {
    const raw = localStorage.getItem("orders");
    const orders = raw ? JSON.parse(raw) : [];

    const shippingAddr = addresses[selectedAddressIdx] || addresses[0] || emptyAddress();
    const now = new Date().toISOString();

    // determine initial order status: if payment received => Processing, otherwise Pending
    let initialStatus = "Pending";
    if (opts.paymentStatus === "Paid") initialStatus = "Processing";

    const newOrder: any = {
      id: makeId(),
      user: {
        id: user?.id || null,
        name: fullname,
        email: user?.email || user?.username || "",
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
      status: initialStatus,
      paymentMethod: opts.paymentMethod,
      paymentStatus: opts.paymentStatus,
      statusHistory: [
        {
          status: initialStatus,
          at: now,
          note: opts.paymentStatus === "Paid" ? "Thanh toán đã nhận" : "Đơn hàng tạo (chờ xử lý)",
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    try {
      const usersRaw = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersRaw);
      const idx = users.findIndex((u: any) =>
        ((u.email || "").toLowerCase() === (user?.email || "").toLowerCase()) ||
        ((u.username || "").toLowerCase() === (user?.username || "").toLowerCase())
      );
      if (idx >= 0) {
        users[idx].phone = phone;
        users[idx].addresses = addresses.map((a: any) => ({ ...a }));
        localStorage.setItem("users", JSON.stringify(users));
      }
    } catch (err) {
    }

    clearCart();
    window.dispatchEvent(new StorageEvent("storage", { key: "orders", newValue: JSON.stringify(orders) }));

    if (opts.paymentStatus === "Paid") {
      toast.success("Thanh toán thành công — Đơn hàng đã được đặt!");
    } else {
      toast.success("Đơn hàng đã được tạo. Chọn COD khi nhận hàng.");
    }

    navigate("/profile-orders");
  };

  // --- called when user clicks "Thanh toán/Đặt hàng" ---
  const handlePay = () => {
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

    if (paymentMethod === "cod") {
      finalizeOrder({ paymentMethod: "COD", paymentStatus: "Pending" });
      return;
    }

    if (paymentMethod === "momo") {
      setShowQrModal(true);
      setCountdown(6);

      countdownRef.current = window.setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            return 0;
          }
          return c - 1;
        });
      }, 1000) as unknown as number;

      autoConfirmTimeoutRef.current = window.setTimeout(() => {
    
        if (countdownRef.current) {
          window.clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setShowQrModal(false);
        finalizeOrder({ paymentMethod: "Momo", paymentStatus: "Paid" });
      }, 6000) as unknown as number;
    }
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (autoConfirmTimeoutRef.current) {
        window.clearTimeout(autoConfirmTimeoutRef.current);
        autoConfirmTimeoutRef.current = null;
      }
    };
  }, []);

  const cancelQr = () => {
    setShowQrModal(false);
    setCountdown(0);
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (autoConfirmTimeoutRef.current) {
      window.clearTimeout(autoConfirmTimeoutRef.current);
      autoConfirmTimeoutRef.current = null;
    }
    toast.info("Bạn đã huỷ thanh toán Momo. Vui lòng chọn phương thức khác hoặc thử lại.");
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

      {/* Payment method selector */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Phương thức thanh toán</h3>
        <div className="flex items-center gap-4">
          <label className={`p-3 border rounded cursor-pointer ${paymentMethod === "cod" ? "border-green-500 bg-green-50" : ""}`}>
            <input type="radio" className="mr-2" name="pay" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
            Thanh toán khi nhận hàng (COD)
          </label>

          <label className={`p-3 border rounded cursor-pointer ${paymentMethod === "momo" ? "border-indigo-500 bg-indigo-50" : ""}`}>
            <input type="radio" className="mr-2" name="pay" checked={paymentMethod === "momo"} onChange={() => setPaymentMethod("momo")} />
            Momo (quét QR)
          </label>
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
          <button onClick={handlePay} className="bg-green-600 text-white px-4 py-2 rounded">Đặt hàng</button>
        </div>
      </div>

      {/* QR Modal (simple) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h4 className="text-lg font-semibold mb-3">Quét QR Momo để thanh toán</h4>

            {/* Placeholder QR box */}
            <div className="mx-auto mb-4 w-48 h-48 bg-gray-100 flex items-center justify-center border rounded">
              {/* You can replace with an <img src="..." /> QR real if you have */}
              <div className="text-center text-sm text-gray-600">
                <div className="font-bold text-xl">QR CODE</div>
                <div className="text-xs mt-2">Momo giả lập</div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div>Đang chờ quét... phần mềm giả lập sẽ tự hoàn tất sau:</div>
              <div className="text-2xl font-bold mt-2">{countdown}s</div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={cancelQr} className="px-4 py-2 border rounded">Huỷ</button>
              <button onClick={() => {
                // manual confirm (user clicked "Đã thanh toán")
                if (countdownRef.current) {
                  window.clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
                if (autoConfirmTimeoutRef.current) {
                  window.clearTimeout(autoConfirmTimeoutRef.current);
                  autoConfirmTimeoutRef.current = null;
                }
                setShowQrModal(false);
                finalizeOrder({ paymentMethod: "Momo", paymentStatus: "Paid" });
              }} className="px-4 py-2 bg-indigo-600 text-white rounded">Đã thanh toán</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
