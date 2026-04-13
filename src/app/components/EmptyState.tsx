import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--lokadia-soft-white)" }}
      >
        <div style={{ color: "var(--lokadia-blue)" }}>{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-sm" style={{ color: "var(--lokadia-text-light)" }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-transform active:scale-95"
          style={{ backgroundColor: "#0A2545" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}