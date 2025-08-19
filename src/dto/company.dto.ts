import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  cnpj: string;
}

export class UpdateCompanyDto {
  @IsString()
  name?: string;

  @IsString()
  cnpj?: string;
}
