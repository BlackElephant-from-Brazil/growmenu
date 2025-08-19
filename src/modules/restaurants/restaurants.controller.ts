import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../../dto/restaurant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createRestaurantDto: CreateRestaurantDto,
    @Request() req,
  ) {
    return this.restaurantsService.create(createRestaurantDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.restaurantsService.findAll();
  }

  @Get('my-restaurants')
  async findMyRestaurants(@Request() req) {
    return this.restaurantsService.findByUserId(req.user.userId);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return this.restaurantsService.findByCompanyId(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ) {
    return this.restaurantsService.update(
      id,
      updateRestaurantDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.restaurantsService.remove(id, req.user.userId);
  }
}
