export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-10 w-32 rounded-lg" />
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <LoadingSkeleton className="h-4 w-24" />
            <LoadingSkeleton className="h-8 w-16" />
            <LoadingSkeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-200 p-6 space-y-3">
        <LoadingSkeleton className="h-6 w-40 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <LoadingSkeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export default Spinner;
