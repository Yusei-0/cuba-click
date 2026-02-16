import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
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
import { ProductDetailModal } from "./components/ProductDetailModal";

import { CategoryResolver } from "./pages/CategoryResolver";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
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
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        
        {/* Standalone product detail (for direct links/SEO) */}
        <Route path="/producto/:slug" element={<ProductDetailPage />} />
        <Route path="/p/:slug" element={<ProductDetailPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        
        {/* Dynamic Category Route & 404 */}
        <Route path="/categorias/:categoryName" element={<CategoryResolver />} />
        <Route path="/:categoryName" element={<CategoryResolver />} />
        <Route path="*" element={<NotFoundPage />} />

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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="productos/nuevo" element={<AdminProductFormPage />} />
          <Route path="productos/:id" element={<AdminProductFormPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="categorias/nueva" element={<AdminCategoryFormPage />} />
          <Route path="categorias/:id" element={<AdminCategoryFormPage />} />
          <Route path="proveedores" element={<AdminProvidersPage />} />
          <Route path="proveedores/nuevo" element={<AdminProviderFormPage />} />
          <Route path="proveedores/:id" element={<AdminProviderFormPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
