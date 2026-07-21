export default function AdminOrdersLoading() {
  return (
    <div>
      <div className="h-8 w-32 animate-pulse rounded-lg bg-stone-200" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-stone-200" />
        ))}
      </div>
    </div>
  );
}
