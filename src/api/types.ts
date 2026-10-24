export type ThemeColors = {
  primary: string;
  accent: string;
  background: string;
  text: string;
  sidebarBg: string;
  sidebarText: string;
};

export type BrandSettings = {
  brandName: string;
  logoUrl: string;
  logoWhiteUrl: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  country: string;
  assetBaseUrl: string;
  themeColors: ThemeColors;
  paymentMethods: PaymentMethodOption[];
  razorpayKeyId?: string;
  social: Record<string, string>;
  raw: any;
};

export type PaymentMethodOption = {
  id: string;
  label: string;
  kind: 'cod' | 'razorpay' | 'other';
};

export type Banner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  placement?: string;
};

export type MenuItem = {
  id: string;
  label: string;
  handle?: string;
  path?: string;
  categoryId?: string;
  children: MenuItem[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  imageUrl: string;
  tabs?: string[];
};

export type ProductOption = {
  key: string;
  label: string;
  values: string[];
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  images: string[];
  category?: string;
  unit?: string;
  tag?: string;
  inStock: boolean;
  options: ProductOption[];
  raw: any;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  placement?: string;
};

export type StoreLocation = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string[];
  imageUrl: string;
  mapUrl: string;
  tags: string[];
};

export type HomeSection = {
  id: string;
  title: string;
  description: string;
  type: 'products' | 'categories' | 'banner' | string;
  products: Product[];
  categories: Collection[];
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  viewAllUrl?: string;
};

export type CheckoutField = {
  id: string;
  name: string;
  fieldKey: string;
  fieldType: string;
  options: string[];
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  maxLength?: number;
};

export type CartLine = {
  lineKey: string;
  slug: string;
  title: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  options?: Record<string, string>;
  engraving?: string;
  checkoutFields?: Record<string, string>;
};

export type PromotionOffer = {
  id: string;
  code: string;
  name: string;
  summary: string;
  reason: string;
  requiresCouponCode: boolean;
  applied: boolean;
};

export type PromotionEval = {
  subtotal: number;
  discountTotal: number;
  discountedSubtotal: number;
  applied: PromotionOffer[];
  almost: PromotionOffer[];
  offers: PromotionOffer[];
  couponApplied: boolean;
  couponMessage: string;
};

export type CartSnapshot = {
  items: CartLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  raw?: any;
};

export type AuthUser = {
  customerId: string;
  token: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
};

export type WebsiteOrder = {
  id: string;
  invoiceNo?: string;
  status: string;
  total: number;
  createdAt?: string;
  paymentMethod?: string;
  lines: CartLine[];
  raw: any;
};
