import { X, Copy, CheckCircle, Package } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingCode: string;
  orderTotal: string;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  trackingCode,
  orderTotal,
}: OrderSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleViewOrders = () => {
    onClose();
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          ¡Pedido Confirmado!
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Tu pedido ha sido registrado exitosamente
        </p>

        {/* Tracking code */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Código de Seguimiento</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-3xl font-bold text-blue-600 tracking-wider">
              {trackingCode}
            </p>
            <button
              onClick={handleCopy}
              className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100"
              title="Copiar código"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-2 text-center">
              ¡Código copiado!
            </p>
          )}
        </div>

        {/* Order total */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Pagado:</span>
            <span className="text-2xl font-bold text-gray-900">{orderTotal}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-900 font-medium mb-2">
            📋 Instrucciones Importantes:
          </p>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Guarda este código para rastrear tu pedido</li>
            <li>Recibirás una llamada para confirmar tu pedido</li>
            <li>El tiempo de entrega depende de tu ubicación</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleViewOrders}
            className="btn btn-primary btn-lg w-full text-white font-bold"
          >
            Ver Mis Pedidos
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline btn-lg w-full font-bold"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
}
