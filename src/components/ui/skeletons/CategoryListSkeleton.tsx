export function CategoryListSkeleton() {
  return (
    <div className="w-full overflow-hidden py-4 pl-4">
      <div className="flex gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-100"></div>
            <div className="w-12 h-3 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
