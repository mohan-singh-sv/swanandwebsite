import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CollectionPage } from './pages/CollectionPage';
import { ContactPage } from './pages/ContactPage';
import { FaqsPage } from './pages/FaqsPage';
import { HomePage } from './pages/HomePage';
import { LocationsPage } from './pages/LocationsPage';
import { LoginPage } from './pages/LoginPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductPage } from './pages/ProductPage';
import { SearchPage } from './pages/SearchPage';
import { SectionPage } from './pages/SectionPage';
import { SignupPage } from './pages/SignupPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/section/:id" element={<SectionPage />} />
          <Route path="/collection/:handle" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
