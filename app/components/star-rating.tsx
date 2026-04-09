import { Star } from "lucide-react";

export function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating: number | null;
  count: number;
  size?: "sm" | "md";
}) {
  if (rating === null || count === 0) {
    return (
      <span className={`text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`}>
        No ratings yet
      </span>
    );
  }

  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-1 ${textSize}`}>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={`${iconSize} ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
            />
          );
        })}
      </span>
      <span className="font-medium">{rating}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}

export function InteractiveStarRating({
  currentRating,
  onRate,
  disabled,
}: {
  currentRating: number | null;
  onRate: (rating: number) => void;
  disabled: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = currentRating !== null && starValue <= currentRating;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onRate(starValue)}
            className="rounded p-0.5 transition-colors hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
          >
            <Star
              className={`size-5 ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400"}`}
            />
          </button>
        );
      })}
    </span>
  );
}
