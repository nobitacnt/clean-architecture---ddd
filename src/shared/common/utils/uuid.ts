import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * Utility functions for UUID generation and validation
 */
export class UuidUtil {
  /**
   * Generate a new UUID v4
   */
  static generate(): string {
    return uuidv4();
  }

  /**
   * Validate a UUID string
   */
  static validate(uuid: string): boolean {
    return uuidValidate(uuid);
  }

  /**
   * Validate and throw error if invalid
   */
  static validateOrThrow(uuid: string, fieldName: string = 'UUID'): void {
    if (!this.validate(uuid)) {
      throw new Error(`${fieldName} must be a valid UUID`);
    }
  }
}
