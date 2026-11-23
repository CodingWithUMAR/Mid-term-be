import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const KEY = "turbo_guest_cart";

function readGuest() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function guestSummary(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items: items.map(i => ({ ...i, lineTotal: i.price * i.quantity })), subtotal, currency: "PKR" };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => guestSummary(readGuest()));
  const [busy, setBusy] = useState(false);

  const saveGuest = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    setCart(guestSummary(items));
  };

  const refresh = async () => {
    if (!user) { setCart(guestSummary(readGuest())); return; }
    const data = await api("/store/cart");
    setCart(data);
  };

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      try {
        const guest = readGuest();
        if (user && guest.length) {
          await api("/store/cart/merge", { method: "POST", body: { items: guest.map(({productId,size,color,quantity}) => ({productId,size,color,quantity})) } });
          localStorage.removeItem(KEY);
        }
        const data = user ? await api("/store/cart") : guestSummary(readGuest());
        if (!cancelled) setCart(data);
      } catch (error) {
        if (!cancelled) setCart(guestSummary(readGuest()));
        console.error("Cart sync failed:", error.message);
      }
    }
    sync();
    return () => { cancelled = true; };
  }, [user?.id]);

  const addItem = async (product, size, color, quantity = 1) => {
    setBusy(true);
    try {
      if (user) {
        const data = await api("/store/cart/items", { method: "POST", body: { productId: product.id, size, color, quantity } });
        setCart(data);
      } else {
        const items = readGuest();
        const found = items.find(i => i.productId === product.id && i.size === size && i.color === color);
        if (found) found.quantity = Math.min(10, found.quantity + quantity);
        else items.push({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0], price: product.price, size, color, quantity });
        saveGuest(items);
      }
    } finally { setBusy(false); }
  };

  const updateItem = async (item, quantity) => {
    if (user) {
      const data = await api(`/store/cart/items/${item.productId}`, { method: "PATCH", body: { size: item.size, color: item.color, quantity } });
      setCart(data);
    } else {
      const items = readGuest().map(i => i.productId === item.productId && i.size === item.size && i.color === item.color ? { ...i, quantity } : i);
      saveGuest(items);
    }
  };

  const removeItem = async (item) => {
    if (user) {
      const data = await api(`/store/cart/items/${item.productId}`, { method: "DELETE", body: { size: item.size, color: item.color } });
      setCart(data);
    } else {
      saveGuest(readGuest().filter(i => !(i.productId === item.productId && i.size === item.size && i.color === item.color)));
    }
  };

  const value = useMemo(() => ({ cart, busy, refresh, addItem, updateItem, removeItem }), [cart, busy, user]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
