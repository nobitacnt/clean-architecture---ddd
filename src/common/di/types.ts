export const TYPES = {
  // Common
  Logger: Symbol.for('Logger'),
  InternalEventBus: Symbol.for('InternalEventBus'),
  DomainEventsDispatcher: Symbol.for('DomainEventsDispatcher'),
  IDBClient: Symbol.for('IDBClient'),
  ILogger: Symbol.for('ILogger'),

    // Order Module - Infrastructure
  OrderRepository: Symbol.for('OrderRepository'),
  
  // Order Module - Commands
  CreateOrderCommand: Symbol.for('CreateOrderCommand'),
  ChangeOrderStatusCommand: Symbol.for('ChangeOrderStatusCommand'),
  
  // Order Module - Queries
  GetOrderQuery: Symbol.for('GetOrderQuery'),
  
  // Order Module - Mappers
  OrderMapper: Symbol.for('OrderMapper'),
  
  // Order Module - Event Handlers
  OrderCreatedEventHandler: Symbol.for('OrderCreatedEventHandler'),
  
  // Order Module - Domain Services
  OrderDomainService: Symbol.for('OrderDomainService'),
  
  // Order Module - Presentation
  OrderController: Symbol.for('OrderController'),
  OrderResolver: Symbol.for('OrderResolver'),
};
