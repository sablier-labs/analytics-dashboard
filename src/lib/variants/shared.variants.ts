import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

// Container variants - matching accounting website design system
export const containerVariants = tv({
  base: [
    "bg-white dark:bg-bg-secondary",
    "border border-border-default",
    "transition-colors duration-200",
  ],
  defaultVariants: {
    elevation: "sm",
    rounded: "lg",
    spacing: "default",
  },
  variants: {
    elevation: {
      lg: "shadow-lg",
      md: "shadow-md",
      none: "shadow-none",
      sm: "shadow-sm",
    },
    rounded: {
      lg: "rounded-lg",
      md: "rounded-md",
      none: "rounded-none",
      sm: "rounded-sm",
      xl: "rounded-xl",
    },
    spacing: {
      compact: "p-4",
      default: "p-6",
      none: "p-0",
      spacious: "p-8",
    },
  },
});

// Badge variants - matching accounting website design system
export const badgeVariants = tv({
  base: [
    "inline-flex items-center font-medium transition-all duration-200",
    "border px-2 py-1 rounded-md text-xs",
  ],
  defaultVariants: {
    color: "default",
  },
  variants: {
    color: {
      default: [
        "bg-bg-tertiary text-text-secondary border-border-default",
        "dark:bg-surface-raised dark:text-text-secondary dark:border-border-default",
      ],
      error: [
        "bg-red-50 text-red-700 border-red-200",
        "dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30",
      ],
      info: [
        "bg-blue-50 text-blue-700 border-blue-200",
        "dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30",
      ],
      orange: [
        "bg-orange-50 text-orange-700 border-orange-200",
        "dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800/30",
      ],
      success: [
        "bg-emerald-50 text-emerald-700 border-emerald-200",
        "dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30",
      ],
      warning: [
        "bg-amber-50 text-amber-700 border-amber-200",
        "dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30",
      ],
    },
  },
});

export type ContainerVariants = VariantProps<typeof containerVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
