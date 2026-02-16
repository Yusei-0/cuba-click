

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
      
      {/* Form sections skeleton */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Cliente section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-6 bg-gray-300 rounded w-40 mb-5"></div>
          
          {/* CI field */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          {/* Nombre field */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          {/* Teléfono field */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          {/* Municipio field */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          {/* Dirección field */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
            <div className="h-24 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
        
        {/* Pedido section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-6 bg-gray-300 rounded w-40 mb-5"></div>
          
          {/* Cantidad field */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          {/* Moneda field */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
          
          {/* Método de pago field */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Resumen section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-6 bg-gray-300 rounded w-32 mb-5"></div>
          
          {/* Product info */}
          <div className="flex gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-24 mt-2"></div>
            </div>
          </div>
          
          {/* Totals */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <div className="h-5 bg-gray-300 rounded w-16"></div>
              <div className="h-5 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom button skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="h-14 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
