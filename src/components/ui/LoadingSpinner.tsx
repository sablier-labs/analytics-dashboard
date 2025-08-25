type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  lg: "w-8 h-8",
  md: "w-6 h-6",
  sm: "w-4 h-4",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-sablier-200 border-t-sablier-500" />
    </div>
  );
}
