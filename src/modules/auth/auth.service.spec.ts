import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../../dto/user.dto';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    id: 'uuid-123',
    name: 'João Silva',
    email: 'joao@teste.com',
    password: 'hashedPassword',
    restaurant_id: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve validar usuário com credenciais corretas', async () => {
      // Arrange
      const email = 'joao@teste.com';
      const password = '123456';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        restaurant_id: mockUser.restaurant_id,
      });
    });

    it('deve retornar null para senha incorreta', async () => {
      // Arrange
      const email = 'joao@teste.com';
      const password = 'senhaerrada';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null para usuário inexistente', async () => {
      // Arrange
      const email = 'inexistente@teste.com';
      const password = '123456';
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null se usuário não tem senha', async () => {
      // Arrange
      const email = 'joao@teste.com';
      const password = '123456';
      const userWithoutPassword = { ...mockUser, password: undefined };
      mockUsersService.findByEmail.mockResolvedValue(userWithoutPassword);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        email: 'joao@teste.com',
        password: '123456',
      };
      const validatedUser = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        restaurant_id: mockUser.restaurant_id,
      };
      const token = 'jwt-token-123';

      jest.spyOn(service, 'validateUser').mockResolvedValue(validatedUser);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: validatedUser.email,
        sub: validatedUser.id,
      });
      expect(result).toEqual({
        access_token: token,
        user: validatedUser,
      });
    });

    it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
      // Arrange
      const loginDto: LoginUserDto = {
        email: 'joao@teste.com',
        password: 'senhaerrada',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );
    });
  });
});
