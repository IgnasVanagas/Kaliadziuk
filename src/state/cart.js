const CART_KEY = 'cart_v1';

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], giftCode: null, giftDiscountCents: 0 };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      giftCode: parsed.giftCode || null,
      giftDiscountCents: Number(parsed.giftDiscountCents || 0),
    };
  } catch {
    return { items: [], giftCode: null, giftDiscountCents: 0 };
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  // Notify same-tab listeners (the 'storage' event only fires across tabs).
  try {
    window.dispatchEvent(new Event('cart:updated'));
  } catch {
    // ignore
  }
}

export function addItem(cart, item) {
  const idx = cart.items.findIndex(i => i.kind === item.kind && i.productId === item.productId && i.amountCents === item.amountCents);
  const items = [...cart.items];
  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + (item.qty || 1) };
  } else {
    items.push({ ...item, qty: item.qty || 1 });
  }
  return { ...cart, items };
}

export function removeItem(cart, index) {
  const items = cart.items.filter((_, i) => i !== index);
  return { ...cart, items };
}

export function clearCart() {
  return { items: [], giftCode: null, giftDiscountCents: 0 };
}

export function computeSubtotalCents(cart) {
  return cart.items.reduce((sum, i) => sum + (Number(i.unitPriceCents || 0) * Number(i.qty || 1)), 0);
}

export function computeTotalCents(cart) {
  const subtotal = computeSubtotalCents(cart);
  const discount = Math.min(subtotal, Number(cart.giftDiscountCents || 0));
  return subtotal - discount;
}
