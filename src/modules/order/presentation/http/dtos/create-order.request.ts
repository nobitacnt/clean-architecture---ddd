import { IsString, IsArray, IsNumber, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for order item in create order request
 */
export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

/**
 * DTO for create order request
 */
export class CreateOrderRequestDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
