import 'reflect-metadata';
import express, { Application } from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { Container } from 'inversify';
import { container } from './common/di/container';
import { loadCommonModules } from './common/di/load-modules';
import { loadOrderModule } from './modules/order/infrastructure/di/order.module';
import { createOrderRoutes } from './modules/order/presentation/http/routes/order.routes';
import { OrderResolver } from './modules/order/presentation/graphql/resolvers/order.resolver';
import { OrderController } from './modules/order/presentation/http/controllers/order.controller';
import { TYPES } from './common/di/types';
import { ILogger } from './common/data/logger/logger.interface';

/**
 * Server setup and initialization
 */
export class Server {
  private app: Application;
  private apolloServer?: ApolloServer;
  private logger: ILogger;

  constructor(private readonly diContainer: Container) {
    this.app = express();
    this.logger = diContainer.get<ILogger>(TYPES.Logger);
  }

  /**
   * Initialize the server
   */
  async initialize(): Promise<void> {
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Setup REST API routes
    this.setupRestRoutes();

    // Setup GraphQL
    await this.setupGraphQL();

    // Error handling middleware
    this.app.use((err: any, req: any, res: any, next: any) => {
      this.logger.error('Unhandled error', err);
      res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
      });
    });
  }

  /**
   * Setup REST API routes
   */
  private setupRestRoutes(): void {
    this.logger.info('Setting up REST API routes');

    // Bind controller to container
    this.diContainer.bind<OrderController>(TYPES.OrderController).to(OrderController);

    // Order routes
    const orderRoutes = createOrderRoutes(this.diContainer);
    this.app.use('/api/orders', orderRoutes);

    this.logger.info('REST API routes configured');
  }

  /**
   * Setup GraphQL server
   */
  private async setupGraphQL(): Promise<void> {
    this.logger.info('Setting up GraphQL server');

    try {
      // Bind resolver to container
      this.diContainer.bind<OrderResolver>(TYPES.OrderResolver).to(OrderResolver);

      // Build GraphQL schema
      const schema = await buildSchema({
        resolvers: [OrderResolver],
        container: {
          get: (cls) => this.diContainer.get(cls),
        },
        emitSchemaFile: false,
        validate: false,
      });

      // Create Apollo Server
      this.apolloServer = new ApolloServer({
        schema,
      });

      await this.apolloServer.start();

      // Apply Apollo middleware
      this.app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(this.apolloServer)
      );

      this.logger.info('GraphQL server configured');
    } catch (error) {
      this.logger.error('Failed to setup GraphQL server', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start(port: number = 3000): Promise<void> {
    await this.initialize();

    this.app.listen(port, () => {
      this.logger.info(`Server is running on port ${port}`);
      this.logger.info(`REST API: http://localhost:${port}/api`);
      this.logger.info(`GraphQL: http://localhost:${port}/graphql`);
      this.logger.info(`Health check: http://localhost:${port}/health`);
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (this.apolloServer) {
      await this.apolloServer.stop();
    }
    this.logger.info('Server stopped');
  }

  /**
   * Get Express application
   */
  getApp(): Application {
    return this.app;
  }
}

/**
 * Create and configure the server
 */
export async function createServer(): Promise<Server> {
  // Load all modules into DI container
  loadCommonModules(container);
  loadOrderModule(container);

  // Create server
  const server = new Server(container);

  return server;
}
