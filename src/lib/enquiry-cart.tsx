"use client";

import { useSyncExternalStore } from "react";

export type EnquiryItem = {
  key: string; // `${productSlug}::${variationId ?? "simple"}`
  productSlug: string;
  productName: string;
  variationId?: string;
  variationLabel?: string;
  image: string | null;
  quantity: number;
};

const STORAGE_KEY = "elite-wholesale-enquiry-cart";
const EMPTY_ITEMS: EnquiryItem[] = [];

let items: EnquiryItem[] = EMPTY_ITEMS;
let initialized = false;
let listeners: Array<() => void> = [];

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? (JSON.parse(raw) as EnquiryItem[]) : EMPTY_ITEMS;
  } catch {
    items = EMPTY_ITEMS;
  }
  initialized = true;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

function setItems(next: EnquiryItem[]) {
  items = next;
  persist();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  ensureInitialized();
  return items;
}

function getServerSnapshot() {
  return EMPTY_ITEMS;
}

function addItem(item: Omit<EnquiryItem, "key">) {
  ensureInitialized();
  const key = `${item.productSlug}::${item.variationId ?? "simple"}`;
  const existing = items.find((i) => i.key === key);
  if (existing) {
    setItems(
      items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i)),
    );
  } else {
    setItems([...items, { ...item, key }]);
  }
}

function removeItem(key: string) {
  ensureInitialized();
  setItems(items.filter((i) => i.key !== key));
}

function updateQuantity(key: string, quantity: number) {
  ensureInitialized();
  setItems(
    quantity <= 0
      ? items.filter((i) => i.key !== key)
      : items.map((i) => (i.key === key ? { ...i, quantity } : i)),
  );
}

function clearCart() {
  setItems(EMPTY_ITEMS);
}

export function useEnquiryCart() {
  const currentItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    items: currentItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount: currentItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}
