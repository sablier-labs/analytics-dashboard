import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  ghost: "bg-transparent border-transparent text-gray-700 hover:bg-gray-100",
  outline: "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50",
  primary: "bg-sablier-500 text-white hover:bg-sablier-600 border-sablier-500",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "px-6 py-3 text-base",
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sablier-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
