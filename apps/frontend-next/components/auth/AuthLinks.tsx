import Link from 'next/link';

interface AuthLinksProps {
  mode: 'sign-in' | 'register';
}

export function AuthLinks({ mode }: AuthLinksProps) {
  return (
    <div className="mt-6 text-center text-sm text-gray-600">
      {mode === 'sign-in' ? (
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Create one
          </Link>
        </p>
      ) : (
        <p>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
