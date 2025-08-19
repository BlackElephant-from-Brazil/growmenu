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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../../dto/company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
    @Request() req,
  ) {
    return this.companiesService.create(createCompanyDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get('my-companies')
  async findMyCompanies(@Request() req) {
    return this.companiesService.findByUserId(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    return this.companiesService.update(id, updateCompanyDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.companiesService.remove(id, req.user.userId);
  }
}
