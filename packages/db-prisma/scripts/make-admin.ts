#!/usr/bin/env tsx
/**
 * Script to promote a user to admin role
 *
 * Usage: pnpm --filter @opprs/db-prisma run db:make-admin <email>
 *
 * Requires DATABASE_URL environment variable to be set.
 */

import { findUserByEmail, updateUser } from '../src/users.js';
import { disconnect } from '../src/client.js';

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: pnpm --filter @opprs/db-prisma run db:make-admin <email>');
    process.exit(1);
  }

  console.log(`Looking up user: ${email}`);

  const user = await findUserByEmail(email);

  if (!user) {
    console.error(`User not found: ${email}`);
    await disconnect();
    process.exit(1);
  }

  console.log(`Found user: ${user.id}`);
  console.log(`Current role: ${user.role}`);

  if (user.role === 'ADMIN') {
    console.log('User is already an admin');
    await disconnect();
    process.exit(0);
  }

  const updated = await updateUser(user.id, { role: 'ADMIN' });

  console.log(`Updated role: ${updated.role}`);
  console.log('User is now an admin');

  await disconnect();
}

main().catch(async (error) => {
  console.error('Error:', error);
  await disconnect();
  process.exit(1);
});
