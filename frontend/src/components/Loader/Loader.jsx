
export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4 border', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' }[size];
  return (
    <div className={`${s} border-gold-500/20 border-t-gold-500 rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Spinner size="lg" />
    <span className="text-[0.65rem] tracking-[0.2em] uppercase text-muted">Loading</span>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-noir-700 border border-white/5 rounded overflow-hidden">
    <div className="h-64 bg-white/[0.03] animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-white/[0.03] rounded animate-pulse w-1/3" />
      <div className="h-5 bg-white/[0.03] rounded animate-pulse w-3/4" />
      <div className="h-4 bg-white/[0.03] rounded animate-pulse w-1/2" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default PageLoader;
