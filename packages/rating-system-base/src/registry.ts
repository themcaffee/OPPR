import type { RatingSystem, RatingSystemId, BaseRatingData } from './types.js';

/**
 * Registry for managing rating systems
 *
 * Rating systems register themselves with this registry, allowing
 * consumers to look them up by ID at runtime.
 */
class RatingSystemRegistry {
  private systems: Map<RatingSystemId, RatingSystem> = new Map();

  /**
   * Register a rating system
   * @param system - Rating system to register
   * @throws Error if a system with the same ID is already registered
   */
  register<T extends BaseRatingData>(system: RatingSystem<T>): void {
    if (this.systems.has(system.id)) {
      throw new Error(`Rating system '${system.id}' is already registered`);
    }
    this.systems.set(system.id, system as RatingSystem);
  }

  /**
   * Get a rating system by ID
   * @param id - Rating system identifier
   * @returns Rating system or undefined if not found
   */
  get<T extends BaseRatingData>(id: RatingSystemId): RatingSystem<T> | undefined {
    return this.systems.get(id) as RatingSystem<T> | undefined;
  }

  /**
   * Check if a rating system is registered
   * @param id - Rating system identifier
   * @returns True if system is registered
   */
  has(id: RatingSystemId): boolean {
    return this.systems.has(id);
  }

  /**
   * Get all registered rating system IDs
   * @returns Array of registered system IDs
   */
  getAll(): RatingSystemId[] {
    return Array.from(this.systems.keys());
  }

  /**
   * Unregister a rating system (useful for testing)
   * @param id - Rating system identifier
   * @returns True if system was unregistered, false if not found
   */
  unregister(id: RatingSystemId): boolean {
    return this.systems.delete(id);
  }

  /**
   * Clear all registered rating systems (useful for testing)
   */
  clear(): void {
    this.systems.clear();
  }
}

/**
 * Global singleton registry instance
 */
export const ratingRegistry = new RatingSystemRegistry();

/**
 * Register a rating system with the global registry
 * @param system - Rating system to register
 */
export function registerRatingSystem<T extends BaseRatingData>(system: RatingSystem<T>): void {
  ratingRegistry.register(system);
}

/**
 * Get a rating system from the global registry
 * @param id - Rating system identifier
 * @returns Rating system
 * @throws Error if system is not found
 */
export function getRatingSystem<T extends BaseRatingData>(id: RatingSystemId): RatingSystem<T> {
  const system = ratingRegistry.get<T>(id);
  if (!system) {
    const available = ratingRegistry.getAll();
    throw new Error(
      `Rating system '${id}' not found. Available systems: ${available.length > 0 ? available.join(', ') : 'none'}`
    );
  }
  return system;
}

/**
 * Check if a rating system is registered
 * @param id - Rating system identifier
 * @returns True if system is registered
 */
export function hasRatingSystem(id: RatingSystemId): boolean {
  return ratingRegistry.has(id);
}

/**
 * Get all registered rating system IDs
 * @returns Array of registered system IDs
 */
export function getRegisteredRatingSystems(): RatingSystemId[] {
  return ratingRegistry.getAll();
}
