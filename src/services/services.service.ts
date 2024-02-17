import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ServiceStatus } from './dto/serviceStatus.enum';
import { UpdateServiceStatusDto } from './dto/updateServiceStatus.dto';
import { ServiceDto } from './dto/Service.dto';
import { Point } from 'geojson';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const renameAsync = util.promisify(fs.rename);
const mkdirAsync = util.promisify(fs.mkdir);
const unlinkAsync = util.promisify(fs.unlink);

@Injectable()
export class ServicesService {
  constructor(
    @Inject('SERVICES_REPOSITORY')
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    userId: number,
    file: Express.Multer.File,
  ): Promise<Service> {
    const latitude = parseFloat(createServiceDto.latitude);
    const longitude = parseFloat(createServiceDto.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException(
        'Latitude e longitude devem ser números válidos.',
      );
    }

    const point: Point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const serviceDto = new ServiceDto();
    serviceDto.descricao = createServiceDto.descricao;
    serviceDto.endereco = createServiceDto.endereco;
    serviceDto.tipo = createServiceDto.tipo;
    serviceDto.complemento = createServiceDto.complemento;
    serviceDto.location = point;

    try {
      const service = await this.serviceRepository.create(serviceDto);

      const user = new User();
      user.id = userId;
      service.user = user;
      service.status = ServiceStatus.Inalterado;

      if (file) {
        await this.moveFileToPermanentLocation(file);
        const finalPath = file.filename;
        service.imageUrl = finalPath;
      }

      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      console.log('Entrou no bloco catch', error);
      if (file) {
        await this.deleteTemporaryFile(file);
      }
      throw error;
    }
  }

  async handleFileUpload(file: Express.Multer.File): Promise<string> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido.');
    }
    const filePath = '/path/to/saved/file/' + file.filename;
    return filePath;
  }

  async findAll(): Promise<any[]> {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.user', 'user')
      .select([
        'service.id',
        'service.tipo',
        'service.endereco',
        'service.complemento',
        'service.descricao',
        'service.status',
        'service.imageUrl',
        'user.id',
        'user.nome',
        'user.telefone',
        'user.email',
        'user.role',
      ])
      .addSelect('ST_AsText(service.location)', 'locationText')
      .getRawMany();

    return services
      .map((service) => {
        const match = service.locationText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (match) {
          const longitude = parseFloat(match[1]);
          const latitude = parseFloat(match[2]);
          return {
            id: service.service_id,
            tipo: service.service_tipo,
            endereco: service.service_endereco,
            complemento: service.service_complemento,
            descricao: service.service_descricao,
            status: service.service_status,
            imageUrl: service.service_imageUrl,
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            user: {
              id: service.user_id,
              nome: service.user_nome,
              telefone: service.user_telefone,
              email: service.user_email,
              role: service.user_role,
            },
          };
        }
        return null;
      })
      .filter((service) => service !== null);
  }

  async findOwnerServices(
    userId: number,
    authenticatedUser: User,
  ): Promise<any[]> {
    if (userId !== authenticatedUser.id && authenticatedUser.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esses serviços.',
      );
    }
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'service.id',
        'service.tipo',
        'service.endereco',
        'service.complemento',
        'service.descricao',
        'service.status',
        'service.imageUrl',
        'user.id',
        'user.nome',
        'user.telefone',
        'user.email',
        'user.role',
      ])
      .addSelect('ST_AsText(service.location)', 'locationText')
      .getRawMany();

    return services
      .map((service) => {
        const match = service.locationText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (match) {
          const longitude = parseFloat(match[1]);
          const latitude = parseFloat(match[2]);
          return {
            id: service.service_id,
            tipo: service.service_tipo,
            endereco: service.service_endereco,
            complemento: service.service_complemento,
            descricao: service.service_descricao,
            status: service.service_status,
            imageUrl: service.service_imageUrl,
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            user: {
              id: service.user_id,
              nome: service.user_nome,
              telefone: service.user_telefone,
              email: service.user_email,
              role: service.user_role,
            },
          };
        }
        return null;
      })
      .filter((service) => service !== null);
  }

  async findOne(id: number): Promise<any> {
    const service = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.user', 'user')
      .where('service.id = :id', { id })
      .select([
        'service.id',
        'service.tipo',
        'service.endereco',
        'service.complemento',
        'service.descricao',
        'service.status',
        'service.imageUrl',
        'user.id',
        'user.nome',
        'user.telefone',
        'user.email',
        'user.role',
      ])
      .addSelect('ST_AsText(service.location)', 'locationText')
      .getRawOne();

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const match = service.locationText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      const longitude = parseFloat(match[1]);
      const latitude = parseFloat(match[2]);
      return {
        id: service.service_id,
        tipo: service.service_tipo,
        endereco: service.service_endereco,
        complemento: service.service_complemento,
        descricao: service.service_descricao,
        status: service.service_status,
        imageUrl: service.service_imageUrl,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        user: {
          id: service.user_id,
          nome: service.user_nome,
          telefone: service.user_telefone,
          email: service.user_email,
          role: service.user_role,
        },
      };
    }

    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const updateResult = await this.serviceRepository.update(
      id,
      updateServiceDto,
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException();
    }

    return this.serviceRepository.findOne({ where: { id: id } });
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateServiceStatusDto,
  ): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException();
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
      throw new NotFoundException();
    }

    return this.serviceRepository.remove(service);
  }

  async checkOwnership(serviceId: number, userId: number): Promise<boolean> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, user: { id: userId } },
    });
    return service ? true : false;
  }

  async moveFileToPermanentLocation(
    file: Express.Multer.File,
  ): Promise<string> {
    const permanentDir = './upload/permanent';
    const finalPath = path.join(permanentDir, file.filename);

    // Criar o diretório se ele não existir
    if (!fs.existsSync(permanentDir)) {
      await mkdirAsync(permanentDir, { recursive: true });
    }

    await renameAsync(file.path, finalPath);
    return finalPath;
  }

  async deleteTemporaryFile(file: Express.Multer.File): Promise<void> {
    console.log(file.path);
    await unlinkAsync(file.path);
  }
}
