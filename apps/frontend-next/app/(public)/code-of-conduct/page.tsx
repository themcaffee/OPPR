import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Code of Conduct - OPPRS',
  description: 'Code of Conduct for the Open Pinball Player Ranking System',
};

export default function CodeOfConductPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Code of Conduct</h1>

        <div className="prose prose-gray max-w-none">
          <p className="mb-4 text-gray-600">Last updated: January 2026</p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">1. Our Pledge</h2>
          <p className="mb-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. We pledge to make participation in our
            community a harassment-free experience for everyone.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">2. Our Standards</h2>
          <p className="mb-4 text-gray-700">
            Examples of behavior that contributes to a positive environment:
          </p>
          <ul className="mb-4 list-inside list-disc space-y-1 text-gray-700">
            <li>Using welcoming and inclusive language</li>
            <li>Being respectful of differing viewpoints and experiences</li>
            <li>Gracefully accepting constructive criticism</li>
            <li>Focusing on what is best for the community</li>
          </ul>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">3. Unacceptable Behavior</h2>
          <p className="mb-4 text-gray-700">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">4. Enforcement</h2>
          <p className="mb-4 text-gray-700">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam.
          </p>

          <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">5. Reporting</h2>
          <p className="mb-4 text-gray-700">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores.
          </p>
        </div>
      </Card>
    </div>
  );
}
