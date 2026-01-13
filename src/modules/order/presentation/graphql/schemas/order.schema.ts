import { ObjectType, Field, ID, Float, Int } from 'type-graphql';

/**
 * GraphQL type for order item
 */
@ObjectType()
export class OrderItemType {
  @Field()
  productId!: string;

  @Field()
  productName!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  price!: number;

  @Field(() => Float)
  subtotal!: number;
}

/**
 * GraphQL type for order
 */
@ObjectType()
export class OrderType {
  @Field(() => ID)
  id!: string;

  @Field()
  customerId!: string;

  @Field(() => [OrderItemType])
  items!: OrderItemType[];

  @Field(() => Float)
  totalAmount!: number;

  @Field()
  status!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

/**
 * GraphQL type for create order result
 */
@ObjectType()
export class CreateOrderResultType {
  @Field(() => ID)
  id!: string;

  @Field()
  customerId!: string;

  @Field(() => Float)
  totalAmount!: number;

  @Field()
  status!: string;

  @Field()
  createdAt!: string;

  @Field()
  message!: string;
}

/**
 * GraphQL type for change order status result
 */
@ObjectType()
export class ChangeOrderStatusResultType {
  @Field(() => ID)
  id!: string;

  @Field()
  previousStatus!: string;

  @Field()
  newStatus!: string;

  @Field()
  updatedAt!: string;

  @Field()
  message!: string;
}
