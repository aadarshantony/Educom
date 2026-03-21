import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 14, showCount = false, count = 0 }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const v = i + 1;
    if (rating >= v) return 'full';
    if (rating >= v - 0.5) return 'half';
    return 'empty';
  });

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((type, i) => (
        <span key={i}>
          {type === 'full'  && <Star  size={size} className="text-gold-500 fill-gold-500" />}
          {type === 'half'  && <StarHalf size={size} className="text-gold-500 fill-gold-500" />}
          {type === 'empty' && <Star  size={size} className="text-gold-500/25" />}
        </span>
      ))}
      {showCount && (
        <span className="ml-1 text-muted text-[0.7rem]">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
