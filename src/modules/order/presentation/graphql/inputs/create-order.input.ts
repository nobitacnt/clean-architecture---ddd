import { Field, InputType, Int, Float } from 'type-graphql';
import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

/**
 * GraphQL input type for order item
 */
@InputType()
export class CreateOrderItemInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price!: number;
}

/**
 * GraphQL input type for creating an order
 */
@InputType()
export class CreateOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @Field(() => [CreateOrderItemInput])
  items!: CreateOrderItemInput[];
}
