import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, User } from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path || (path !== "/" && currentPath.startsWith(path));
  };

  const navItems = [
    { name: "Inicio", path: "/", icon: Home },
    { name: "Buscar", path: "/catalogo", icon: Search },
    { name: "Pedidos", path: "/pedidos", icon: ShoppingBag },
    { name: "Perfil", path: "/perfil", icon: User },
  ];

  return (
    <div className="bg-white border-t border-gray-100 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
              active ? "text-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon
              className={`h-6 w-6 mb-1 ${
                active ? "fill-current" : "stroke-2"
              }`}
            />
            <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
