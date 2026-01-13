import { Field, InputType } from 'type-graphql';
import { IsString, IsEnum } from 'class-validator';

/**
 * GraphQL input type for changing order status
 */
@InputType()
export class ChangeOrderStatusInput {
  @Field()
  @IsString()
  orderId!: string;

  @Field()
  @IsEnum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  newStatus!: string;
}
