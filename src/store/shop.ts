import { create } from 'zustand';
import { websiteApi } from '../api/website';
import type { AuthUser, Banner, Collection, HomeSection, MenuItem, Product, PromotionEval } from '../api/types';
export type CartItem = {
  lineKey: string;
  slug: string;
  title: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
};

const KEY = 'swanand.web.shop';

type State = {
  ready: boolean;
  guest: boolean;
  user: AuthUser | null;
  items: CartItem[];
  couponCode: string;
  promo: PromotionEval | null;
  banners: Banner[];
  announcements: Banner[];
  collections: Collection[];
  sections: HomeSection[];
  menu: MenuItem[];
  assetBaseUrl: string;
  restore: () => void;
  bootstrap: () => Promise<void>;
  skipLogin: () => void;
  login: (email: string, password: string) => Promise<void>;
  completeSignup: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    verificationToken: string;
  }) => Promise<void>;
  logout: () => void;
  addProduct: (product: Product) => void;
  setQty: (lineKey: string, quantity: number) => void;
  setCouponCode: (code: string) => void;
  refreshPromotions: () => Promise<void>;
  placeOrder: (input: {
    address: string;
    payment: string;
    paymentId?: string;
    checkoutFields?: { fieldKey: string; value: string }[];
  }) => Promise<string>;
};

function persist(state: State) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      guest: state.guest,
      user: state.user,
      items: state.items,
      couponCode: state.couponCode,
    }),
  );
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function cartPayable(items: CartItem[], promo: PromotionEval | null) {
  const subtotal = cartTotal(items);
  if (!promo) return subtotal;
  return promo.discountedSubtotal || Math.max(0, subtotal - (promo.discountTotal || 0));
}

export function lineForProduct(items: CartItem[], slug: string) {
  return items.find((item) => item.slug === slug);
}

export const useShop = create<State>((set, get) => ({
  ready: false,
  guest: false,
  user: null,
  items: [],
  couponCode: '',
  promo: null,
  banners: [],
  announcements: [],
  collections: [],
  sections: [],
  menu: [],
  assetBaseUrl: '',
  restore: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          guest: Boolean(parsed.guest),
          user: parsed.user || null,
          items: Array.isArray(parsed.items) ? parsed.items : [],
          couponCode: parsed.couponCode || '',
        });
      }
    } catch {
      // ignore
    }
    set({ ready: true });
  },
  bootstrap: async () => {
    const settings = await websiteApi.settings();
    const assetBaseUrl = settings.assetBaseUrl;
    const [banners, announcements, collections, sections, menu] = await Promise.all([
      websiteApi.banners(assetBaseUrl),
      websiteApi.announcements(assetBaseUrl),
      websiteApi.collections(assetBaseUrl),
      websiteApi.sections(assetBaseUrl),
      websiteApi.menu(),
    ]);
    set({ banners, announcements, collections, sections, menu, assetBaseUrl });
  },
  skipLogin: () => {
    set({ guest: true });
    persist(get());
  },
  login: async (email, password) => {
    const user = await websiteApi.login(email, password);
    set({ user, guest: false });
    persist(get());
  },
  completeSignup: async (input) => {
    const user = await websiteApi.register(input);
    set({ user, guest: false });
    persist(get());
  },
  logout: () => {
    set({ user: null, guest: false, items: [], promo: null, couponCode: '' });
    persist(get());
  },
  addProduct: (product) => {
    const items = [...get().items];
    const existing = items.find((item) => item.slug === product.slug);
    if (existing) existing.quantity += 1;
    else {
      items.push({
        lineKey: product.slug,
        slug: product.slug,
        title: product.title,
        imageUrl: product.imageUrl,
        quantity: 1,
        unitPrice: product.price,
        unit: product.unit,
      });
    }
    set({ items });
    persist(get());
    get().refreshPromotions().catch(() => undefined);
  },
  setQty: (lineKey, quantity) => {
    const items =
      quantity <= 0 ? get().items.filter((item) => item.lineKey !== lineKey) : get().items.map((item) => (item.lineKey === lineKey ? { ...item, quantity } : item));
    set({ items });
    persist(get());
    get().refreshPromotions().catch(() => undefined);
  },
  setCouponCode: (code) => {
    set({ couponCode: code });
    persist(get());
  },
  refreshPromotions: async () => {
    const items = get().items;
    if (!items.length) {
      set({ promo: null });
      return;
    }
    const promo = await websiteApi.evaluatePromotions({
      lines: items.map((item) => ({ slug: item.slug, quantity: item.quantity, unitPrice: item.unitPrice })),
      couponCode: get().couponCode,
      customerId: get().user?.customerId,
    });
    set({ promo });
  },
  placeOrder: async ({ address, payment, paymentId, checkoutFields }) => {
    const state = get();
    if (!state.user?.token) throw new Error('Please log in to place an order.');
    const city = address.split(',').map((part) => part.trim()).filter(Boolean).slice(-1)[0] || address;
    const payload: Record<string, unknown> = {
      customer: {
        name: state.user.name,
        email: state.user.email,
        phone: state.user.phone,
        address,
        city,
      },
      shippingMethod: 'standard',
      paymentMethod: payment,
      lines: state.items.map((item) => ({ slug: item.slug, quantity: item.quantity, unitPrice: item.unitPrice })),
      customerId: state.user.customerId,
      customerToken: state.user.token,
    };
    if (checkoutFields?.length) payload.checkoutFields = checkoutFields;
    if (state.couponCode.trim()) payload.couponCode = state.couponCode.trim();
    if (paymentId) {
      payload.paymentId = paymentId;
      payload.razorpayPaymentId = paymentId;
      payload.transactionId = paymentId;
      payload.paymentStatus = 'paid';
    }
    const order = await websiteApi.placeOrder(payload);
    set({ items: [], promo: null, couponCode: '' });
    persist(get());
    return order.id;
  },
}));

export const isLoggedIn = (user: AuthUser | null) => Boolean(user?.token && user.token !== user.customerId);
