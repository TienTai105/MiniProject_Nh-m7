import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string | null;
};

type CartStore = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number, size?: string | null) => void;
  updateQuantity: (id: number, qty: number, size?: string | null) => void;
  increaseQuantity: (id: number, size?: string | null) => void;
  decreaseQuantity: (id: number, size?: string | null) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const qtyToAdd = product.quantity ?? 1;
        const sizeNorm = product.size ?? null;
        const existing = get().cart.find((item) => item.id === product.id && (item.size ?? null) === sizeNorm);
        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item.id === product.id && (item.size ?? null) === sizeNorm
                ? { ...item, quantity: item.quantity + qtyToAdd }
                : item
            ),
          });
        } else {
          const { quantity, ...rest } = product as any;
          set({ cart: [...get().cart, { ...(rest as Omit<CartItem, "quantity">), quantity: qtyToAdd }] });
        }
      },

      removeFromCart: (id: number, size?: string | null) =>
        set({ cart: get().cart.filter((item) => !(item.id === id && (item.size ?? null) === (size ?? null))) }),

      updateQuantity: (id: number, qty: number, size?: string | null) => {
        if (qty <= 0) {
          set({ cart: get().cart.filter((item) => !(item.id === id && (item.size ?? null) === (size ?? null))) });
        } else {
          set({ cart: get().cart.map((item) => (item.id === id && (item.size ?? null) === (size ?? null) ? { ...item, quantity: qty } : item)) });
        }
      },

      increaseQuantity: (id: number, size?: string | null) => {
        set({ cart: get().cart.map((item) => (item.id === id && (item.size ?? null) === (size ?? null) ? { ...item, quantity: item.quantity + 1 } : item)) });
      },

      decreaseQuantity: (id: number, size?: string | null) => {
        set({ cart: get().cart.flatMap((item) => (item.id === id && (item.size ?? null) === (size ?? null) ? (item.quantity - 1 <= 0 ? [] : [{ ...item, quantity: item.quantity - 1 }]) : [item])) });
      },

      clearCart: () => set({ cart: [] }),
    }),
    { name: "cart-storage" } // key trong localStorage
  )
);
