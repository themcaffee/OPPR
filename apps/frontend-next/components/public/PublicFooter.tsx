import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            Open Pinball Player Ranking System
          </div>
          <nav className="flex space-x-6">
            <Link href="/rankings" className="text-sm text-gray-500 hover:text-gray-900">
              Rankings
            </Link>
            <Link href="/tournaments" className="text-sm text-gray-500 hover:text-gray-900">
              Tournaments
            </Link>
            <Link href="/players" className="text-sm text-gray-500 hover:text-gray-900">
              Players
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
