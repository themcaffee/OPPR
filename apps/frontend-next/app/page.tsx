import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">OPPRS</h1>
      <p className="mt-4 text-lg text-gray-600">Open Pinball Player Ranking System</p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/sign-in"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
