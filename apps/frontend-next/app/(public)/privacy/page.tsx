import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Privacy Policy - OPPRS',
  description: 'Privacy Policy for the Open Pinball Player Ranking System',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <p className="mb-4 text-gray-600">Last updated: January 2026</p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">
            1. Information We Collect
          </h2>
          <p className="mb-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">
            2. How We Use Your Information
          </h2>
          <p className="mb-4 text-gray-700">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">3. Information Sharing</h2>
          <p className="mb-4 text-gray-700">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">4. Data Security</h2>
          <p className="mb-4 text-gray-700">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">5. Your Rights</h2>
          <p className="mb-4 text-gray-700">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
            voluptatum deleniti atque corrupti quos dolores.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">6. Contact Us</h2>
          <p className="mb-4 text-gray-700">
            Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta
            nobis est eligendi optio cumque nihil impedit.
          </p>
        </div>
      </Card>
    </div>
  );
}
