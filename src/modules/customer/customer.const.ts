export const CUSTOMER_TYPES = {
  CustomerWriteRepository: Symbol.for('CustomerWriteRepository'),
  CustomerReadRepository: Symbol.for('CustomerReadRepository'),
  CreateCustomerCommand: Symbol.for('CreateCustomerCommand'),
  CustomerCreatedEventHandler: Symbol.for('CustomerCreatedEventHandler'),
  CustomerMapper: Symbol.for('CustomerMapper'),
  CustomerController: Symbol.for('CustomerController'),
};
