import { Card } from '@/components/ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-600">{label}</p>
        {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
      </div>
    </Card>
  );
}
