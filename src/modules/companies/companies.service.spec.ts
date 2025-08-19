import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from '../../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../../dto/company.dto';

describe('CompaniesService', () => {
  let service: CompaniesService;

  const mockCompanyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompany = {
    id: 'company-uuid-123',
    name: 'Empresa Teste',
    cnpj: '12345678000123',
    user_manager_id: 'user-uuid-123',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCompanyDto: CreateCompanyDto = {
      name: 'Empresa Teste',
      cnpj: '12345678000123',
    };
    const userId = 'user-uuid-123';

    it('deve criar uma empresa com sucesso', async () => {
      // Arrange
      mockCompanyRepository.findOne.mockResolvedValue(null);
      mockCompanyRepository.create.mockReturnValue(mockCompany);
      mockCompanyRepository.save.mockResolvedValue(mockCompany);

      // Act
      const result = await service.create(createCompanyDto, userId);

      // Assert
      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { cnpj: createCompanyDto.cnpj },
      });
      expect(mockCompanyRepository.create).toHaveBeenCalledWith({
        ...createCompanyDto,
        user_manager_id: userId,
      });
      expect(mockCompanyRepository.save).toHaveBeenCalledWith(mockCompany);
      expect(result).toEqual(mockCompany);
    });

    it('deve lançar ConflictException se CNPJ já existir', async () => {
      // Arrange
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(service.create(createCompanyDto, userId)).rejects.toThrow(
        new ConflictException('CNPJ já está em uso'),
      );
    });
  });

  describe('findById', () => {
    it('deve retornar uma empresa por ID', async () => {
      // Arrange
      const companyId = 'company-uuid-123';
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      // Act
      const result = await service.findById(companyId);

      // Assert
      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: companyId },
        relations: ['user_manager', 'restaurants'],
      });
      expect(result).toEqual(mockCompany);
    });

    it('deve lançar NotFoundException se empresa não existir', async () => {
      // Arrange
      const companyId = 'company-inexistente';
      mockCompanyRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(companyId)).rejects.toThrow(
        new NotFoundException('Empresa não encontrada'),
      );
    });
  });

  describe('update', () => {
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Nome Atualizado',
    };

    it('deve atualizar empresa se usuário for o manager', async () => {
      // Arrange
      const companyId = 'company-uuid-123';
      const userId = 'user-uuid-123';
      const updatedCompany = { ...mockCompany, ...updateCompanyDto };

      jest.spyOn(service, 'findById').mockResolvedValue(mockCompany);
      mockCompanyRepository.save.mockResolvedValue(updatedCompany);

      // Act
      const result = await service.update(companyId, updateCompanyDto, userId);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedCompany);
    });

    it('deve lançar ForbiddenException se usuário não for o manager', async () => {
      // Arrange
      const companyId = 'company-uuid-123';
      const userId = 'outro-user-uuid';

      jest.spyOn(service, 'findById').mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        service.update(companyId, updateCompanyDto, userId),
      ).rejects.toThrow(
        new ForbiddenException(
          'Você não tem permissão para editar esta empresa',
        ),
      );
    });
  });

  describe('remove', () => {
    it('deve deletar empresa se usuário for o manager', async () => {
      // Arrange
      const companyId = 'company-uuid-123';
      const userId = 'user-uuid-123';

      jest.spyOn(service, 'findById').mockResolvedValue(mockCompany);
      mockCompanyRepository.remove.mockResolvedValue(undefined);

      // Act
      await service.remove(companyId, userId);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.remove).toHaveBeenCalledWith(mockCompany);
    });

    it('deve lançar ForbiddenException se usuário não for o manager', async () => {
      // Arrange
      const companyId = 'company-uuid-123';
      const userId = 'outro-user-uuid';

      jest.spyOn(service, 'findById').mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(service.remove(companyId, userId)).rejects.toThrow(
        new ForbiddenException(
          'Você não tem permissão para deletar esta empresa',
        ),
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de todas as empresas', async () => {
      // Arrange
      const companies = [mockCompany];
      mockCompanyRepository.find.mockResolvedValue(companies);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        relations: ['user_manager', 'restaurants'],
      });
      expect(result).toEqual(companies);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar empresas do usuário', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      const companies = [mockCompany];
      mockCompanyRepository.find.mockResolvedValue(companies);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: { user_manager_id: userId },
        relations: ['restaurants'],
      });
      expect(result).toEqual(companies);
    });
  });
});
