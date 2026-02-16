import { Link } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";
import { Home, Search as SearchIcon } from "lucide-react";

export function NotFoundPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6 -mt-20">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center relative mb-4">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full animate-pulse"></div>
                <SearchIcon className="w-16 h-16 text-gray-300" />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">¿Te has perdido?</h1>
                <p className="text-gray-500 max-w-xs mx-auto">
                    No pudimos encontrar la categoría o página que buscas. Tal vez fue movida o ya no existe.
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link to="/" className="btn btn-primary w-full rounded-xl h-12 text-lg font-bold shadow-lg shadow-blue-500/20">
                    <Home className="w-5 h-5 mr-2" />
                    Ir al Inicio
                </Link>
                <Link to="/catalogo" className="btn btn-ghost bg-gray-50 text-gray-600 w-full rounded-xl h-12 font-medium hover:bg-gray-100">
                    Ver Catálogo Completo
                </Link>
            </div>
        </div>
      </div>
    </MobileLayout>
  );
}
