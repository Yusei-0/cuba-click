import { useRef } from "react";
import { getCategoryIcon } from "../../lib/categoryIcons";
import * as LucideIcons from "lucide-react";

interface Category {
  id: string;
  nombre: string;
  icono?: string | null; // Nombre del icono en Lucide o null
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (id: string) => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
}

export function CategoryList({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  onEndReached,
  isLoadingMore 
}: CategoryListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current || !onEndReached) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    if (scrollWidth - (scrollLeft + clientWidth) < 50) {
      onEndReached();
    }
  };

  const renderIcon = (cat: Category, isSelected: boolean) => {
    if (cat.icono) {
      const IconComponent = (LucideIcons as any)[cat.icono];
      if (IconComponent) {
        return <IconComponent className={`w-6 h-6 ${isSelected ? "text-white" : "text-blue-600"}`} />;
      }
    }
    
    // Check if it's a generic fallback
    const IconComponent = getCategoryIcon(cat.nombre);
    return <IconComponent className={`w-6 h-6 ${isSelected ? "text-white" : "text-blue-600"}`} />;
  };

  // Filter Unique and Non-Generic Categories (Subjective "Necessary" filter)
  // We filter out duplicates by name
  const seenNames = new Set();
  const filteredCategories = categories.filter(cat => {
    const name = cat.nombre.toLowerCase().trim();
    if (seenNames.has(name)) return false;
    seenNames.add(name);
    
    // Optional: If we wanted to hide generic icons, we could check getCategoryIcon result here.
    // For now, just deduplicating is safer to avoid empty lists.
    return true; 
  });

  return (
    <div 
      className="w-full overflow-x-auto no-scrollbar py-4 pl-4" // Increased py for shadow
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <div className="flex gap-4 min-w-max pr-4"> 
        {filteredCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border ${
                selectedCategory === cat.id
                  ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/30 scale-105"
                  : "bg-blue-50 border-blue-100 hover:border-blue-200 hover:bg-blue-100"
              }`}
            >
              {renderIcon(cat, selectedCategory === cat.id)}
            </div>
            <span
              className={`text-[12px] font-medium transition-colors max-w-[70px] truncate capitalize ${
                selectedCategory === cat.id ? "text-blue-600 font-bold" : "text-gray-600"
              }`}
            >
              {cat.nombre}
            </span>
          </button>
        ))}
        {isLoadingMore && (
           <div className="flex flex-col items-center gap-1.5 justify-center w-16 h-16">
             <span className="loading loading-spinner loading-xs text-primary"></span>
           </div>
        )}
      </div>
    </div>
  );
}
