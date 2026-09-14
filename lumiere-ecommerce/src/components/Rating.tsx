import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export default function Rating({ rating, reviewCount, size = 'sm' }: RatingProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 fill-gray-300'
            }`}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className={`${textSize} text-gray-500`}>
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
