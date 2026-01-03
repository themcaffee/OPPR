import { Card } from '@/components/ui/Card';

export function NoPlayerProfile() {
  return (
    <Card className="col-span-full">
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Player Profile Linked
        </h2>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Your account is not yet linked to a player profile. This is required to view
          your rankings and tournament results.
        </p>
        <p className="text-sm text-gray-500">
          Please contact an administrator to link your account to your player profile.
        </p>
      </div>
    </Card>
  );
}
