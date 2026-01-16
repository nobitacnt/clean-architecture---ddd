import { v4 as uuidv4, validate } from 'uuid';

export class CustomerId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(): CustomerId {
    return new CustomerId(uuidv4());
  }

  static fromString(value: string): CustomerId {
    if (!validate(value)) {
      throw new Error(`Invalid customer ID: ${value}`);
    }
    return new CustomerId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }
}
