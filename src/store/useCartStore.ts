import { create } from "zustand";
import type { Database } from "../types/database.types";

type Product = Database["public"]["Tables"]["productos"]["Row"];

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const items = get().items;

    // Check for provider mismatch
    if (items.length > 0) {
      const currentProviderId = items[0].proveedor_id;
      if (product.proveedor_id !== currentProviderId) {
        // Different provider: Replace cart
        set({ items: [{ ...product, quantity: 1 }] });
        return;
      }
    }

    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  totalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),
  totalPrice: () =>
    get().items.reduce(
      (total, item) => total + item.precio_final * item.quantity,
      0,
    ),
}));
