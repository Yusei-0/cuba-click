import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  icon,
  className = "",
  disabled = false,
  required = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when value changes (optional, usually good UX)
  // But wait, sometimes we want to keep it open? No, usually close on select.
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-left
          bg-white border rounded-xl transition-all duration-200
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' : 'hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
          ${!selectedOption && !placeholder ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <div className="flex items-center gap-3 truncate">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className={`block truncate ${!selectedOption ? 'text-gray-400' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {/* Hidden input for form validation if needed */}
      <input 
        type="text" 
        className="sr-only" 
        value={value} 
        onChange={() => {}} 
        required={required}
        tabIndex={-1}
      />

      {/* Dropdown Menu */}
      <div
        className={`
          absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100
          overflow-hidden transition-all duration-200 origin-top
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
        `}
        style={{ maxHeight: '300px', overflowY: 'auto' }}
      >
        {options.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No hay opciones
          </div>
        ) : (
          <div className="py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors
                    ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
