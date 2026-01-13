import { Container } from 'inversify';
import 'reflect-metadata';

// Create the main DI container
export const container = new Container({
  defaultScope: 'Singleton',
  skipBaseClassChecks: true,
});

export { Container };
