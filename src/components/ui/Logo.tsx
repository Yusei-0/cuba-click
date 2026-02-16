export function Logo({ className = "h-8 w-auto", textClassName = "text-xl" }: { className?: string, textClassName?: string }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="CubaClick Logo"
      >
        <rect width="32" height="32" rx="8" className="fill-blue-600" />
        <path 
            d="M21 10.5C20.2 9.5 18.8 9 17 9C13.5 9 11 11.5 11 16C11 20.5 13.5 23 17 23C18.8 23 20.2 22.5 21 21.5" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
        />
      </svg>
      <span className={`font-bold tracking-tight ${textClassName}`}>
        <span className="text-gray-900">Cuba</span>
        <span className="text-blue-600">Click</span>
      </span>
    </div>
  );
}
