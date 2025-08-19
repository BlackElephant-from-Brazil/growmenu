import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from '../../entities/restaurant.entity';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../../dto/restaurant.dto';
import { CompaniesService } from '../companies/companies.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  const mockRestaurantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompaniesService = {
    findById: jest.fn(),
  };

  const mockCompany = {
    id: 'company-uuid-123',
    name: 'Empresa Teste',
    user_manager_id: 'user-uuid-123',
  };

  const mockRestaurant = {
    id: 'restaurant-uuid-123',
    name: 'Restaurante Teste',
    place: 'Rua das Flores, 123',
    creator_id: 'user-uuid-123',
    company_id: 'company-uuid-123',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRestaurantRepository,
        },
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createRestaurantDto: CreateRestaurantDto = {
      name: 'Restaurante Teste',
      place: 'Rua das Flores, 123',
      company_id: 'company-uuid-123',
    };
    const userId = 'user-uuid-123';

    it('deve criar um restaurante com sucesso', async () => {
      // Arrange
      mockCompaniesService.findById.mockResolvedValue(mockCompany);
      mockRestaurantRepository.create.mockReturnValue(mockRestaurant);
      mockRestaurantRepository.save.mockResolvedValue(mockRestaurant);

      // Act
      const result = await service.create(createRestaurantDto, userId);

      // Assert
      expect(mockCompaniesService.findById).toHaveBeenCalledWith(
        createRestaurantDto.company_id,
      );
      expect(mockRestaurantRepository.create).toHaveBeenCalledWith({
        ...createRestaurantDto,
        creator_id: userId,
      });
      expect(mockRestaurantRepository.save).toHaveBeenCalledWith(
        mockRestaurant,
      );
      expect(result).toEqual(mockRestaurant);
    });

    it('deve lançar ForbiddenException se usuário não for manager da empresa', async () => {
      // Arrange
      const companyWithDifferentManager = {
        ...mockCompany,
        user_manager_id: 'outro-user',
      };
      mockCompaniesService.findById.mockResolvedValue(
        companyWithDifferentManager,
      );

      // Act & Assert
      await expect(service.create(createRestaurantDto, userId)).rejects.toThrow(
        new ForbiddenException(
          'Você não tem permissão para criar restaurantes nesta empresa',
        ),
      );
    });
  });

  describe('findById', () => {
    it('deve retornar um restaurante por ID', async () => {
      // Arrange
      const restaurantId = 'restaurant-uuid-123';
      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);

      // Act
      const result = await service.findById(restaurantId);

      // Assert
      expect(mockRestaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurantId },
        relations: ['creator', 'company', 'users'],
      });
      expect(result).toEqual(mockRestaurant);
    });

    it('deve lançar NotFoundException se restaurante não existir', async () => {
      // Arrange
      const restaurantId = 'restaurant-inexistente';
      mockRestaurantRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(restaurantId)).rejects.toThrow(
        new NotFoundException('Restaurante não encontrado'),
      );
    });
  });

  describe('update', () => {
    const updateRestaurantDto: UpdateRestaurantDto = {
      name: 'Nome Atualizado',
    };

    it('deve atualizar restaurante se usuário for o criador', async () => {
      // Arrange
      const restaurantId = 'restaurant-uuid-123';
      const userId = 'user-uuid-123';
      const updatedRestaurant = { ...mockRestaurant, ...updateRestaurantDto };

      jest.spyOn(service, 'findById').mockResolvedValue(mockRestaurant);
      mockCompaniesService.findById.mockResolvedValue(mockCompany);
      mockRestaurantRepository.save.mockResolvedValue(updatedRestaurant);

      // Act
      const result = await service.update(
        restaurantId,
        updateRestaurantDto,
        userId,
      );

      // Assert
      expect(service.findById).toHaveBeenCalledWith(restaurantId);
      expect(mockCompaniesService.findById).toHaveBeenCalledWith(
        mockRestaurant.company_id,
      );
      expect(mockRestaurantRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedRestaurant);
    });

    it('deve atualizar restaurante se usuário for manager da empresa', async () => {
      // Arrange
      const restaurantId = 'restaurant-uuid-123';
      const userId = 'user-uuid-123'; // mesmo ID do manager
      const restaurantWithDifferentCreator = {
        ...mockRestaurant,
        creator_id: 'outro-user',
      };
      const updatedRestaurant = {
        ...restaurantWithDifferentCreator,
        ...updateRestaurantDto,
      };

      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(restaurantWithDifferentCreator);
      mockCompaniesService.findById.mockResolvedValue(mockCompany);
      mockRestaurantRepository.save.mockResolvedValue(updatedRestaurant);

      // Act
      const result = await service.update(
        restaurantId,
        updateRestaurantDto,
        userId,
      );

      // Assert
      expect(result).toEqual(updatedRestaurant);
    });

    it('deve lançar ForbiddenException se usuário não tiver permissão', async () => {
      // Arrange
      const restaurantId = 'restaurant-uuid-123';
      const userId = 'outro-user-sem-permissao';
      const companyWithDifferentManager = {
        ...mockCompany,
        user_manager_id: 'outro-manager',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockRestaurant);
      mockCompaniesService.findById.mockResolvedValue(
        companyWithDifferentManager,
      );

      // Act & Assert
      await expect(
        service.update(restaurantId, updateRestaurantDto, userId),
      ).rejects.toThrow(
        new ForbiddenException(
          'Você não tem permissão para editar este restaurante',
        ),
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de todos os restaurantes', async () => {
      // Arrange
      const restaurants = [mockRestaurant];
      mockRestaurantRepository.find.mockResolvedValue(restaurants);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRestaurantRepository.find).toHaveBeenCalledWith({
        relations: ['creator', 'company', 'users'],
      });
      expect(result).toEqual(restaurants);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar restaurantes do usuário', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      const restaurants = [mockRestaurant];
      mockRestaurantRepository.find.mockResolvedValue(restaurants);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(mockRestaurantRepository.find).toHaveBeenCalledWith({
        where: { creator_id: userId },
        relations: ['company', 'users'],
      });
      expect(result).toEqual(restaurants);
    });
  });

  describe('findByCompanyId', () => {
    it('deve retornar restaurantes da empresa', async () => {
      // Arrange
      const companyId = 'company-uuid-123';
      const restaurants = [mockRestaurant];
      mockRestaurantRepository.find.mockResolvedValue(restaurants);

      // Act
      const result = await service.findByCompanyId(companyId);

      // Assert
      expect(mockRestaurantRepository.find).toHaveBeenCalledWith({
        where: { company_id: companyId },
        relations: ['creator', 'users'],
      });
      expect(result).toEqual(restaurants);
    });
  });
});
