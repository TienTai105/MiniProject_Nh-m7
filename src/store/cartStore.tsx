import { create } from "zustand";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size?: string | null;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, size?: string | null) => void;
  clearCart: () => void;
  increaseQuantity: (id: number, size?: string | null) => void;
  decreaseQuantity: (id: number, size?: string | null) => void;
  setQuantity: (id: number, size: string | null, quantity: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],

  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find(
        (i) => i.id === item.id && i.size === item.size
      );
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id && i.size === item.size
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { cart: [...state.cart, { ...item }] };
    }),

  removeFromCart: (id, size = null) =>
    set((state) => ({
      cart: state.cart.filter((item) => !(item.id === id && item.size === size)),
    })),

  clearCart: () => set({ cart: [] }),

  increaseQuantity: (id, size = null) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    })),

  decreaseQuantity: (id, size = null) =>
    set((state) => {
      const item = state.cart.find((i) => i.id === id && i.size === size);
      if (!item) return state;

      if (item.quantity <= 1) {
        return {
          cart: state.cart.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity: 0 } : i
          ),
        };
      }

      return {
        cart: state.cart.map((i) =>
          i.id === id && i.size === size
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ),
      };
    }),

  setQuantity: (id, size = null, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      ),
    })),
}));
