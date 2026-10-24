export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''),
  licenseKey: import.meta.env.VITE_LICENSE_KEY || '',
  websiteApiSecret: import.meta.env.VITE_WEBSITE_API_SECRET || '',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
};

export const brand = {
  name: 'Swanand Online',
  tagline: 'स्वस्थ जीवन का आधार',
  logo: '/logo.png',
};
