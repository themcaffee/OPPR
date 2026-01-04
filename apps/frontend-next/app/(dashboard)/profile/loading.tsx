import { Card } from '@/components/ui/Card';

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>
    </Card>
  );
}

function SkeletonTable() {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header skeleton */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard className="h-48" />
            </div>
            <SkeletonCard className="h-48" />
          </div>

          {/* Third row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonTable />
            </div>
            <SkeletonCard className="h-64" />
          </div>
        </div>
      </main>
    </div>
  );
}
