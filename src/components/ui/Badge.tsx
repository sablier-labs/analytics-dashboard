import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return <span className={classes}>{children}</span>;
}
