import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrdersPage } from "./pages/OrdersPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminCategoriesPage } from "./pages/admin/categories/AdminCategoriesPage";
import { AdminCategoryFormPage } from "./pages/admin/categories/AdminCategoryFormPage";
import { AdminProvidersPage } from "./pages/admin/providers/AdminProvidersPage";
import { AdminProviderFormPage } from "./pages/admin/providers/AdminProviderFormPage";
import { AdminExchangeRatesPage } from "./pages/admin/AdminExchangeRatesPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { ProductDetailModal } from "./components/ProductDetailModal";

import { CategoryResolver } from "./pages/CategoryResolver";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useEffect } from "react";
import { useExchangeRatesStore } from "./store/useExchangeRatesStore";
import { useConfigStore } from "./store/useConfigStore";
import { useMunicipiosStore } from "./store/useMunicipiosStore";

export default function App() {
  const { fetchRates } = useExchangeRatesStore();
  const { fetchConfig } = useConfigStore();
  const { fetchMunicipios } = useMunicipiosStore();
  
  useEffect(() => {
    // Prefetch essential data
    fetchRates();
    fetchConfig('base_exchange_source');
    fetchMunicipios();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {/* Public Routes with Main Layout */}
        
        {/* Home with nested modal route */}
        <Route path="/" element={<HomePage />}>
          <Route path="producto/:slug" element={<ProductDetailModal />} />
        </Route>
        
        {/* Catalog with nested modal route */}
        <Route path="/catalogo" element={<CatalogPage />}>
          <Route path="producto/:slug" element={<ProductDetailModal />} />
        </Route>
        
        {/* Favorites with nested modal route */}
        <Route path="/favoritos" element={<FavoritesPage />}>
          <Route path="producto/:slug" element={<ProductDetailModal />} />
        </Route>
        
        <Route path="/cart" element={<CartPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido-confirmado/:id" element={<OrderConfirmationPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        
        {/* Standalone product detail (for direct links/SEO) */}
        <Route path="/producto/:slug" element={<ProductDetailPage />} />
        <Route path="/p/:slug" element={<ProductDetailPage />} />
        
        {/* Dynamic Category Route & 404 */}
        <Route path="/categoria/:slug" element={<CategoryResolver />} />
        <Route path="/categorias/:slug" element={<CategoryResolver />} />
        <Route path="/category/:slug" element={<CategoryResolver />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="productos/nuevo" element={<AdminProductFormPage />} />
          <Route path="productos/editar/:id" element={<AdminProductFormPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="categorias/nueva" element={<AdminCategoryFormPage />} />
          <Route path="categorias/editar/:id" element={<AdminCategoryFormPage />} />
          <Route path="proveedores" element={<AdminProvidersPage />} />
          <Route path="proveedores/nuevo" element={<AdminProviderFormPage />} />
          <Route path="proveedores/editar/:id" element={<AdminProviderFormPage />} />
          <Route path="tasas" element={<AdminExchangeRatesPage />} />
          <Route path="configuracion" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
