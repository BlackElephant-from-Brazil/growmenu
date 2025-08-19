import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from '../../dto/user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  const mockUser = {
    id: 'uuid-123',
    name: 'João Silva',
    email: 'joao@teste.com',
    restaurant_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@teste.com',
        password: '123456',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.register(createUserDto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário logado', async () => {
      // Arrange
      const req = { user: { userId: 'uuid-123' } };
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getProfile(req);

      // Assert
      expect(mockUsersService.findById).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário por ID', async () => {
      // Arrange
      const userId = 'uuid-123';
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de todos os usuários', async () => {
      // Arrange
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });
});
