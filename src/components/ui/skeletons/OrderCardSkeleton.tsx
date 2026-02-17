
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
          
          <div className="space-y-2">
            {/* Status Text & Date */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            {/* Product Name */}
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="h-6 w-16 bg-gray-200 rounded" />
          {/* Chevron */}
          <div className="w-5 h-5 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
