export const ORDER_TYPES = {
  // Order Module - Infrastructure
  OrderWriteRepository: Symbol.for('OrderWriteRepository'),
  OrderReadRepository: Symbol.for('OrderReadRepository'),
  
  // Order Module - Commands
  CreateOrderCommand: Symbol.for('CreateOrderCommand'),
  ChangeOrderStatusCommand: Symbol.for('ChangeOrderStatusCommand'),
  
  // Order Module - Queries
  GetOrderQuery: Symbol.for('GetOrderQuery'),
  
  // Order Module - Mappers
  OrderMapper: Symbol.for('OrderMapper'),
  
  // Order Module - Domain Services
  OrderDomainService: Symbol.for('OrderDomainService'),
  
  // Order Module - Presentation
  OrderController: Symbol.for('OrderController'),
  OrderResolver: Symbol.for('OrderResolver'),
};