import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
} from "lucide-react";

export function AdminLayout() {
  const { signOut } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/productos", label: "Productos", icon: Package },
    { path: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-base-100 shadow-xl z-20 fixed h-full">
        <div className="p-4 border-b border-base-200">
          <h1 className="text-xl font-bold px-2 text-primary">Admin Panel</h1>
        </div>
        <ul className="menu p-4 w-full gap-2 grow">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link to={item.path} className={isActive ? "active" : ""}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="p-4 border-t border-base-200">
          <button
            onClick={() => signOut()}
            className="btn btn-ghost w-full justify-start gap-2 text-error"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Wrapper */}
      <div className="drawer lg:hidden">
        <input
          id="admin-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isSidebarOpen}
          onChange={(e) => setIsSidebarOpen(e.target.checked)}
        />
        <div className="drawer-content flex flex-col h-full">
          {/* Mobile Header usually goes in main content, but putting toggle here */}
        </div>
        <div className="drawer-side z-50">
          <label
            htmlFor="admin-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="menu p-4 w-64 min-h-full bg-base-100 text-base-content flex flex-col">
            <div className="mb-4">
              <h1 className="text-xl font-bold px-2 text-primary">
                Admin Panel
              </h1>
            </div>
            <ul className="gap-2 grow">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={isActive ? "active" : ""}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto">
              <button
                onClick={() => signOut()}
                className="btn btn-ghost w-full justify-start gap-2 text-error"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-base-100 shadow-sm p-4 flex items-center gap-4 sticky top-0 z-30">
          <label htmlFor="admin-drawer" className="btn btn-ghost btn-circle">
            <Menu className="h-6 w-6" />
          </label>
          <h1 className="text-lg font-bold">Administración</h1>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
