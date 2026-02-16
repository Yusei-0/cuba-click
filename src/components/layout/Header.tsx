import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Logo } from "../ui/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm">
      <Link to="/">
        <Logo />
      </Link>
      <div className="flex items-center gap-3">
        <button className="btn btn-circle btn-ghost btn-sm">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
