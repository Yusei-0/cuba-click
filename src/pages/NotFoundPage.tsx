import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-12 h-12 text-gray-400" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-600 mb-6">
        Página no encontrada
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Lo sentimos, la página que buscas no existe o ha sido movida. Intenta
        volver al inicio o buscar en nuestro catálogo.
      </p>
      <Link to="/" className="btn btn-primary btn-lg gap-2">
        <ArrowLeft className="w-5 h-5" /> Volver al Inicio
      </Link>
    </div>
  );
}
