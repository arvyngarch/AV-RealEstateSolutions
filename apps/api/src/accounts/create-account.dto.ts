import { IsIn } from 'class-validator';

export class CreateAccountDto {
  @IsIn(['BUYER', 'SELLER'])
  role!: 'BUYER' | 'SELLER';
}
