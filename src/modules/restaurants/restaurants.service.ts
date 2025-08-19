import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../../entities/restaurant.entity';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../../dto/restaurant.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly companiesService: CompaniesService,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    userId: string,
  ): Promise<Restaurant> {
    const { company_id } = createRestaurantDto;

    // Verificar se a empresa existe e se o usuário é o manager
    const company = await this.companiesService.findById(company_id);
    if (company.user_manager_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para criar restaurantes nesta empresa',
      );
    }

    // Criar restaurante
    const restaurant = this.restaurantRepository.create({
      ...createRestaurantDto,
      creator_id: userId,
    });

    return this.restaurantRepository.save(restaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      relations: ['creator', 'company', 'users'],
    });
  }

  async findById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['creator', 'company', 'users'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    return restaurant;
  }

  async findByUserId(userId: string): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { creator_id: userId },
      relations: ['company', 'users'],
    });
  }

  async findByCompanyId(companyId: string): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { company_id: companyId },
      relations: ['creator', 'users'],
    });
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    userId: string,
  ): Promise<Restaurant> {
    const restaurant = await this.findById(id);

    // Verificar se o usuário é o criador do restaurante ou o manager da empresa
    const company = await this.companiesService.findById(restaurant.company_id);
    if (
      restaurant.creator_id !== userId &&
      company.user_manager_id !== userId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este restaurante',
      );
    }

    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async remove(id: string, userId: string): Promise<void> {
    const restaurant = await this.findById(id);

    // Verificar se o usuário é o criador do restaurante ou o manager da empresa
    const company = await this.companiesService.findById(restaurant.company_id);
    if (
      restaurant.creator_id !== userId &&
      company.user_manager_id !== userId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este restaurante',
      );
    }

    await this.restaurantRepository.remove(restaurant);
  }
}
