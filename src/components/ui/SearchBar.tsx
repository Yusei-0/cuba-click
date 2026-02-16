import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = "¿Qué estás buscando hoy?", onSearch }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 rounded-box bg-gray-100 border-none text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
