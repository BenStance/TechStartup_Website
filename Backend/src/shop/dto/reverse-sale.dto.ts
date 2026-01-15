import { IsNumber } from 'class-validator';

export class ReverseSaleDto {
  @IsNumber()
  saleId: number;
}