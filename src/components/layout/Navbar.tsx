import { Menu, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function Navbar() {

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4">
      {/* Navbar Start */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <Menu className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/catalogo">Catálogo</Link>
            </li>
            <li>
              <Link to="/pedidos">Mis Pedidos</Link>
            </li>
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          VentasHabana
        </Link>
      </div>

      {/* Navbar Center (Hidden on mobile if search is closed) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/catalogo">Catálogo</Link>
          </li>
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-2">
        {/* Mobile Search Toggle */}
        <button
          className="btn btn-ghost btn-circle lg:hidden"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          {isSearchOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>

        {/* Desktop Search */}
        <div className="hidden lg:block form-control">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="input input-bordered w-24 md:w-auto"
          />
        </div>

        {/* Cart */}
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {isSearchOpen && (
        <div className="absolute top-16 left-0 w-full p-2 bg-base-100 shadow-md lg:hidden">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="input input-bordered w-full"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
