export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 h-full flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-square bg-gray-100 rounded-xl"></div>
      <div className="space-y-2 grow">
        <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
        <div className="w-1/2 h-6 bg-gray-100 rounded"></div>
      </div>
      <div className="w-full h-10 bg-gray-100 rounded-xl mt-auto"></div>
    </div>
  );
}
