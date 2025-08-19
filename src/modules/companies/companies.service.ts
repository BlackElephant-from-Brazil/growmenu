import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../../dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    userId: string,
  ): Promise<Company> {
    const { cnpj } = createCompanyDto;

    // Verificar se o CNPJ já existe
    const existingCompany = await this.companyRepository.findOne({
      where: { cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ já está em uso');
    }

    // Criar empresa
    const company = this.companyRepository.create({
      ...createCompanyDto,
      user_manager_id: userId,
    });

    return this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ['user_manager', 'restaurants'],
    });
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['user_manager', 'restaurants'],
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  async findByUserId(userId: string): Promise<Company[]> {
    return this.companyRepository.find({
      where: { user_manager_id: userId },
      relations: ['restaurants'],
    });
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
  ): Promise<Company> {
    const company = await this.findById(id);

    // Verificar se o usuário é o manager da empresa
    if (company.user_manager_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar esta empresa',
      );
    }

    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string, userId: string): Promise<void> {
    const company = await this.findById(id);

    // Verificar se o usuário é o manager da empresa
    if (company.user_manager_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar esta empresa',
      );
    }

    await this.companyRepository.remove(company);
  }
}
