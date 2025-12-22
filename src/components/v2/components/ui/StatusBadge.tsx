import { cn } from "@/lib/utils";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-green-100 text-green-700 hover:bg-green-200",
  warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  error: "bg-red-100 text-red-700 hover:bg-red-200",
  info: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  neutral: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors inline-block",
      statusStyles[status] || statusStyles.neutral,
      className
    )}>
      {children}
    </span>
  );
}
