import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Terms of Service - OPPRS',
  description: 'Terms of Service for the Open Pinball Player Ranking System',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Service</h1>

        <div className="prose prose-gray max-w-none">
          <p className="mb-4 text-gray-600">Last updated: January 2026</p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p className="mb-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">2. Use of Service</h2>
          <p className="mb-4 text-gray-700">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">3. User Accounts</h2>
          <p className="mb-4 text-gray-700">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">4. Intellectual Property</h2>
          <p className="mb-4 text-gray-700">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">5. Termination</h2>
          <p className="mb-4 text-gray-700">
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
            velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam
            aliquam quaerat voluptatem.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">
            6. Limitation of Liability
          </h2>
          <p className="mb-4 text-gray-700">
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
            laboriosam, nisi ut aliquid ex ea commodi consequatur.
          </p>
        </div>
      </Card>
    </div>
  );
}
