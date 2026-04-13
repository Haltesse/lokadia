import { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function Chip({ children, selected = false, onClick, icon, className = "" }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all flex-shrink-0 whitespace-nowrap ${
        selected
          ? "bg-lokadia-deep-blue text-white"
          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-lokadia-blue"
      } ${className}`}
      style={selected ? { backgroundColor: "#0A2545" } : {}}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}