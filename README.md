# Swanand Online — grocery website

React (Vite) grocery storefront for tenant Swanand. It talks to the same HMAC Website APIs as the React Native app, against [stagingswanand.oryxretail.com](https://stagingswanand.oryxretail.com/). Staging currently still serves the August Park jewelry theme; this app is the grocery UI with the Swanand logo and mobile-app colors.

## Run

```bash
cd website
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to staging so CORS is not needed locally.

## APIs used

Health, settings, banners, announcements, menu, collections, products, search, sections, FAQs, locations, contact, auth (lookup/OTP/register/login), cart, promotions, checkout fields, and orders.
# swanandwebsite
