import { Link } from "react-router-dom";
import { ShoppingCart, Bell } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export function Header() {
  const cartItemsCount = useCartStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
          C
        </div>
        <span className="text-xl font-bold text-primary tracking-tight">
          CubaClick
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-circle btn-ghost btn-sm">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <Link to="/carrito" className="btn btn-circle btn-ghost btn-sm relative">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
          {cartItemsCount > 0 && (
            <span className="badge badge-sm badge-primary absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center border-2 border-white">
              {cartItemsCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
