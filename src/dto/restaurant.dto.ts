import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  place: string;

  @IsNotEmpty()
  @IsUUID()
  company_id: string;
}

export class UpdateRestaurantDto {
  @IsString()
  name?: string;

  @IsString()
  place?: string;
}
