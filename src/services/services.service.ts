import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { Admin, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ServiceStatus } from './dto/serviceStatus.enum';
import { UpdateServiceStatusDto } from './dto/updateServiceStatus.dto';

@Injectable()
export class ServicesService {
  constructor(
    @Inject('SERVICES_REPOSITORY')
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    userId: number,
  ): Promise<Service> {
    const service = await this.serviceRepository.create(createServiceDto);

    const user = new User();
    user.id = userId;
    service.user = user;
    service.status = ServiceStatus.Pendente;

    await this.serviceRepository.save(service);
    return service;
  }

  async findAll() {
    return this.serviceRepository.find();
  }

  async findOwnerServices(
    userId: number,
    authenticatedUser: User,
  ): Promise<Service[]> {
    if (userId !== authenticatedUser.id && authenticatedUser.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esses serviços.',
      );
    }
    return this.serviceRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service ID ${id} not found`);
    }
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const updateResult = await this.serviceRepository.update(
      id,
      updateServiceDto,
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Service ID ${id} not found`);
    }

    return this.serviceRepository.findOne({ where: { id: id } });
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateServiceStatusDto,
  ): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado.`);
    }

    service.status = updateStatusDto.status;
    await this.serviceRepository.save(service);

    return service;
  }

  async remove(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service ID ${id} not found`);
    }

    return this.serviceRepository.remove(service);
  }

  async checkOwnership(serviceId: number, userId: number): Promise<boolean> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, user: { id: userId } },
    });
    return service ? true : false;
  }
}
