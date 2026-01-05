import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import {
  createApiKey,
  findApiKeyById,
  findApiKeysByPrefix,
  getUserApiKeys,
  countUserApiKeys,
  updateApiKeyLastUsed,
  deleteApiKey,
  deleteUserApiKey,
  MAX_API_KEYS_PER_USER,
} from '../src/api-keys.js';
import { prisma } from '../src/client.js';

let userCounter = 0;

function createTestUser() {
  userCounter++;
  return prisma.user.create({
    data: {
      email: `test-user-${userCounter}-${Date.now()}@example.com`,
      passwordHash: 'test-hash',
    },
  });
}

beforeEach(() => {
  userCounter = 0;
});

describe('api-keys', () => {
  describe('MAX_API_KEYS_PER_USER', () => {
    it('should be 5', () => {
      expect(MAX_API_KEYS_PER_USER).toBe(5);
    });
  });

  describe('createApiKey', () => {
    it('should create an API key with required fields', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      const apiKey = await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_te',
        keyHash,
        userId: user.id,
      });

      expect(apiKey.id).toBeDefined();
      expect(apiKey.name).toBe('Test Key');
      expect(apiKey.keyPrefix).toBe('opprs_te');
      expect(apiKey.keyHash).toBe(keyHash);
      expect(apiKey.userId).toBe(user.id);
      expect(apiKey.expiresAt).toBeNull();
      expect(apiKey.lastUsedAt).toBeNull();
      expect(apiKey.createdAt).toBeInstanceOf(Date);
      expect(apiKey.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an API key with expiration date', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const expiresAt = new Date(Date.now() + 86400000); // 1 day from now

      const apiKey = await createApiKey({
        name: 'Expiring Key',
        keyPrefix: 'opprs_ex',
        keyHash,
        userId: user.id,
        expiresAt,
      });

      expect(apiKey.expiresAt).toEqual(expiresAt);
    });

    it('should create an API key with null expiration', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      const apiKey = await createApiKey({
        name: 'Never Expires',
        keyPrefix: 'opprs_nv',
        keyHash,
        userId: user.id,
        expiresAt: null,
      });

      expect(apiKey.expiresAt).toBeNull();
    });

    it('should cascade delete when user is deleted', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      const apiKey = await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_cs',
        keyHash,
        userId: user.id,
      });

      await prisma.user.delete({ where: { id: user.id } });

      const found = await findApiKeyById(apiKey.id);
      expect(found).toBeNull();
    });
  });

  describe('findApiKeyById', () => {
    it('should find an existing API key by ID', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const created = await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_fb',
        keyHash,
        userId: user.id,
      });

      const found = await findApiKeyById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe('Test Key');
    });

    it('should return null for non-existent ID', async () => {
      const found = await findApiKeyById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findApiKeysByPrefix', () => {
    it('should find keys by prefix with user data', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_prefix1',
        keyHash,
        userId: user.id,
      });

      const keys = await findApiKeysByPrefix('opprs_prefix1');

      expect(keys).toHaveLength(1);
      expect(keys[0].user).toBeDefined();
      expect(keys[0].user.id).toBe(user.id);
      expect(keys[0].user.email).toBe(user.email);
      expect(keys[0].user.role).toBe('USER');
    });

    it('should return multiple keys with same prefix', async () => {
      const user = await createTestUser();
      const keyHash1 = await bcrypt.hash('opprs_sameprefix_key1', 10);
      const keyHash2 = await bcrypt.hash('opprs_sameprefix_key2', 10);

      await createApiKey({
        name: 'Key 1',
        keyPrefix: 'opprs_same',
        keyHash: keyHash1,
        userId: user.id,
      });
      await createApiKey({
        name: 'Key 2',
        keyPrefix: 'opprs_same',
        keyHash: keyHash2,
        userId: user.id,
      });

      const keys = await findApiKeysByPrefix('opprs_same');

      expect(keys).toHaveLength(2);
    });

    it('should return empty array for non-existent prefix', async () => {
      const keys = await findApiKeysByPrefix('opprs_nonexistent');

      expect(keys).toHaveLength(0);
    });

    it('should include keyHash for verification', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_hash',
        keyHash,
        userId: user.id,
      });

      const keys = await findApiKeysByPrefix('opprs_hash');

      expect(keys[0].keyHash).toBe(keyHash);
    });
  });

  describe('getUserApiKeys', () => {
    it('should return all keys for a user', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      await createApiKey({
        name: 'Key 1',
        keyPrefix: 'opprs_k1',
        keyHash,
        userId: user.id,
      });
      await createApiKey({
        name: 'Key 2',
        keyPrefix: 'opprs_k2',
        keyHash,
        userId: user.id,
      });

      const keys = await getUserApiKeys(user.id);

      expect(keys).toHaveLength(2);
    });

    it('should not include keyHash in response', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_nh',
        keyHash,
        userId: user.id,
      });

      const keys = await getUserApiKeys(user.id);

      expect((keys[0] as Record<string, unknown>).keyHash).toBeUndefined();
    });

    it('should include expected fields', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const expiresAt = new Date(Date.now() + 86400000);
      await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_ef',
        keyHash,
        userId: user.id,
        expiresAt,
      });

      const keys = await getUserApiKeys(user.id);

      expect(keys[0].id).toBeDefined();
      expect(keys[0].name).toBe('Test Key');
      expect(keys[0].keyPrefix).toBe('opprs_ef');
      expect(keys[0].expiresAt).toEqual(expiresAt);
      expect(keys[0].lastUsedAt).toBeNull();
      expect(keys[0].createdAt).toBeInstanceOf(Date);
    });

    it('should order by createdAt descending', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      await createApiKey({
        name: 'Key 1',
        keyPrefix: 'opprs_o1',
        keyHash,
        userId: user.id,
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createApiKey({
        name: 'Key 2',
        keyPrefix: 'opprs_o2',
        keyHash,
        userId: user.id,
      });

      const keys = await getUserApiKeys(user.id);

      expect(keys[0].name).toBe('Key 2');
      expect(keys[1].name).toBe('Key 1');
    });

    it('should return empty array for user with no keys', async () => {
      const user = await createTestUser();

      const keys = await getUserApiKeys(user.id);

      expect(keys).toHaveLength(0);
    });

    it('should not return keys from other users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      await createApiKey({
        name: 'User 1 Key',
        keyPrefix: 'opprs_u1',
        keyHash,
        userId: user1.id,
      });
      await createApiKey({
        name: 'User 2 Key',
        keyPrefix: 'opprs_u2',
        keyHash,
        userId: user2.id,
      });

      const user1Keys = await getUserApiKeys(user1.id);
      const user2Keys = await getUserApiKeys(user2.id);

      expect(user1Keys).toHaveLength(1);
      expect(user1Keys[0].name).toBe('User 1 Key');
      expect(user2Keys).toHaveLength(1);
      expect(user2Keys[0].name).toBe('User 2 Key');
    });
  });

  describe('countUserApiKeys', () => {
    it('should count API keys for a user', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      await createApiKey({ name: 'Key 1', keyPrefix: 'opprs_c1', keyHash, userId: user.id });
      await createApiKey({ name: 'Key 2', keyPrefix: 'opprs_c2', keyHash, userId: user.id });
      await createApiKey({ name: 'Key 3', keyPrefix: 'opprs_c3', keyHash, userId: user.id });

      const count = await countUserApiKeys(user.id);

      expect(count).toBe(3);
    });

    it('should return 0 for user with no keys', async () => {
      const user = await createTestUser();

      const count = await countUserApiKeys(user.id);

      expect(count).toBe(0);
    });

    it('should not count keys from other users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      await createApiKey({ name: 'Key 1', keyPrefix: 'opprs_nc1', keyHash, userId: user1.id });
      await createApiKey({ name: 'Key 2', keyPrefix: 'opprs_nc2', keyHash, userId: user1.id });
      await createApiKey({ name: 'Key 3', keyPrefix: 'opprs_nc3', keyHash, userId: user2.id });

      const count1 = await countUserApiKeys(user1.id);
      const count2 = await countUserApiKeys(user2.id);

      expect(count1).toBe(2);
      expect(count2).toBe(1);
    });
  });

  describe('updateApiKeyLastUsed', () => {
    it('should update lastUsedAt timestamp', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const apiKey = await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_lu',
        keyHash,
        userId: user.id,
      });

      expect(apiKey.lastUsedAt).toBeNull();

      const beforeUpdate = new Date();
      await updateApiKeyLastUsed(apiKey.id);

      const updated = await findApiKeyById(apiKey.id);
      expect(updated!.lastUsedAt).not.toBeNull();
      expect(updated!.lastUsedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should update lastUsedAt on subsequent calls', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const apiKey = await createApiKey({
        name: 'Test Key',
        keyPrefix: 'opprs_su',
        keyHash,
        userId: user.id,
      });

      await updateApiKeyLastUsed(apiKey.id);
      const firstUpdate = await findApiKeyById(apiKey.id);

      await new Promise((resolve) => setTimeout(resolve, 10));
      await updateApiKeyLastUsed(apiKey.id);
      const secondUpdate = await findApiKeyById(apiKey.id);

      expect(secondUpdate!.lastUsedAt!.getTime()).toBeGreaterThanOrEqual(
        firstUpdate!.lastUsedAt!.getTime(),
      );
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an existing API key', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const apiKey = await createApiKey({
        name: 'To Delete',
        keyPrefix: 'opprs_dl',
        keyHash,
        userId: user.id,
      });

      const deleted = await deleteApiKey(apiKey.id);

      expect(deleted.id).toBe(apiKey.id);

      const found = await findApiKeyById(apiKey.id);
      expect(found).toBeNull();
    });

    it('should throw error for non-existent key', async () => {
      await expect(deleteApiKey('non-existent-id')).rejects.toThrow();
    });
  });

  describe('deleteUserApiKey', () => {
    it('should delete key belonging to user', async () => {
      const user = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);
      const apiKey = await createApiKey({
        name: 'To Delete',
        keyPrefix: 'opprs_du',
        keyHash,
        userId: user.id,
      });

      const deleted = await deleteUserApiKey(apiKey.id, user.id);

      expect(deleted).not.toBeNull();
      expect(deleted!.id).toBe(apiKey.id);

      const found = await findApiKeyById(apiKey.id);
      expect(found).toBeNull();
    });

    it('should return null when key does not exist', async () => {
      const user = await createTestUser();

      const deleted = await deleteUserApiKey('non-existent-id', user.id);

      expect(deleted).toBeNull();
    });

    it('should return null when key belongs to different user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const keyHash = await bcrypt.hash('opprs_testkey123', 10);

      const apiKey = await createApiKey({
        name: 'User 1 Key',
        keyPrefix: 'opprs_ou',
        keyHash,
        userId: user1.id,
      });

      const deleted = await deleteUserApiKey(apiKey.id, user2.id);

      expect(deleted).toBeNull();

      // Verify key still exists
      const found = await findApiKeyById(apiKey.id);
      expect(found).not.toBeNull();
    });
  });
});
