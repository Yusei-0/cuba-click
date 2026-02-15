import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductPage } from "./pages/ProductPage";
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
import { ToastContainer } from "./components/ui/ToastContainer";
import { CategoryResolver } from "./pages/CategoryResolver";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          element={
            <Layout>
              <main className="min-h-screen">
                <Outlet />
              </main>
            </Layout>
          }
        >
          {" "}
          {/* Minor adjustment: Layout expects children, Outlet works fine. Wait, Layout has structure. */}
          {/* Actually Layout handles the full page structure. Let's see Layout.tsx again. Layout wraps children in main. Perfect. */}
          {/* We need to pass Outlet as children to Layout. */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedidos" element={<OrdersPage />} />
          {/* Dynamic Category Route & 404 */}
          {/* We place this last to avoid intercepting other routes */}
          <Route path="/:categoryName" element={<CategoryResolver />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

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
