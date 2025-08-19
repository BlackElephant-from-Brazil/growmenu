import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dto/user.dto';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUser = {
    id: 'uuid-123',
    name: 'João Silva',
    email: 'joao@teste.com',
    password: 'hashedPassword',
    restaurant_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'João Silva',
      email: 'joao@teste.com',
      password: '123456',
    };

    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: 'hashedPassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        }),
      );
      expect(result.password).toBeUndefined();
    });

    it('deve lançar ConflictException se email já existir', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email já está em uso'),
      );
    });
  });

  describe('findById', () => {
    it('deve retornar um usuário por ID com sucesso', async () => {
      // Arrange
      const userId = 'uuid-123';
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['restaurant', 'managed_companies'],
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        }),
      );
      expect(result.password).toBeUndefined();
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      // Arrange
      const userId = 'uuid-inexistente';
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('findByEmail', () => {
    it('deve retornar um usuário por email', async () => {
      // Arrange
      const email = 'joao@teste.com';
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null se usuário não existir', async () => {
      // Arrange
      const email = 'inexistente@teste.com';
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários sem senhas', async () => {
      // Arrange
      const users = [
        mockUser,
        { ...mockUser, id: 'uuid-456', email: 'outro@teste.com' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['restaurant', 'managed_companies'],
      });
      expect(result).toHaveLength(2);
      result.forEach((user) => {
        expect(user.password).toBeUndefined();
      });
    });
  });
});
