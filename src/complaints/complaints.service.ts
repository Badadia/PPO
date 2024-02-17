import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint } from './entities/complaint.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ComplaintStatus } from './dto/complaintStatus.enum';
import { UpdateComplaintStatusDto } from './dto/updateComplaintStatus.dto';
import { Point } from 'geojson';
import { ComplaintDto } from './dto/Complaint.dto';

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const renameAsync = util.promisify(fs.rename);
const mkdirAsync = util.promisify(fs.mkdir);
const unlinkAsync = util.promisify(fs.unlink);

@Injectable()
export class ComplaintsService {
  constructor(
    @Inject('COMPLAINTS_REPOSITORY')
    private readonly complaintRepository: Repository<Complaint>,
  ) {}

  async create(
    createComplaintDto: CreateComplaintDto,
    userId: number,
    file: Express.Multer.File,
  ): Promise<Complaint> {
    const latitude = parseFloat(createComplaintDto.latitude);
    const longitude = parseFloat(createComplaintDto.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException(
        'Latitude e longitude devem ser números válidos.',
      );
    }

    const point: Point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const complaintDto = new ComplaintDto();
    complaintDto.descricao = createComplaintDto.descricao;
    complaintDto.endereco = createComplaintDto.endereco;
    complaintDto.setor = createComplaintDto.setor;
    complaintDto.complemento = createComplaintDto.complemento;
    complaintDto.location = point;

    try {
      const complaint = await this.complaintRepository.create(complaintDto);

      const user = new User();
      user.id = userId;
      complaint.user = user;
      complaint.status = ComplaintStatus.Inalterado;

      if (file) {
        await this.moveFileToPermanentLocation(file);
        const finalPath = file.filename;
        complaint.imageUrl = finalPath;
      }

      await this.complaintRepository.save(complaint);
      return complaint;
    } catch (error) {
      console.log('Entrou no bloco catch', error);
      if (file) {
        await this.deleteTemporaryFile(file);
      }
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    const complaints = await this.complaintRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.user', 'user')
      .select([
        'complaint.id',
        'complaint.setor',
        'complaint.endereco',
        'complaint.complemento',
        'complaint.descricao',
        'complaint.status',
        'complaint.imageUrl',
        'user.id',
        'user.nome',
        'user.telefone',
        'user.email',
        'user.role',
      ])
      .addSelect('ST_AsText(complaint.location)', 'locationText')
      .getRawMany();

    return complaints.map((complaint) => {
      const match = complaint.locationText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        const longitude = parseFloat(match[1]);
        const latitude = parseFloat(match[2]);
        return {
          id: complaint.complaint_id,
          setor: complaint.complaint_setor,
          endereco: complaint.complaint_endereco,
          complemento: complaint.complaint_complemento,
          descricao: complaint.complaint_descricao,
          status: complaint.complaint_status,
          imageUrl: complaint.complaint_imageUrl,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          user: {
            id: complaint.user_id,
            nome: complaint.user_nome,
            telefone: complaint.user_telefone,
            email: complaint.user_email,
            role: complaint.user_role,
          },
        };
      }
      return complaint;
    });
  }

  async findOwnerComplaints(
    userId: number,
    authenticatedUser: User,
  ): Promise<any[]> {
    if (userId !== authenticatedUser.id && authenticatedUser.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar essas denúncias.',
      );
    }

    const complaints = await this.complaintRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'complaint.id',
        'complaint.setor',
        'complaint.endereco',
        'complaint.complemento',
        'complaint.descricao',
        'complaint.status',
        'complaint.imageUrl',
        'user.id',
        'user.nome',
        'user.telefone',
        'user.email',
        'user.role',
      ])
      .addSelect('ST_AsText(complaint.location)', 'locationText')
      .getRawMany();

    return complaints
      .map((complaint) => {
        const match = complaint.locationText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (match) {
          const longitude = parseFloat(match[1]);
          const latitude = parseFloat(match[2]);
          return {
            id: complaint.complaint_id,
            setor: complaint.complaint_setor,
            endereco: complaint.complaint_endereco,
            complemento: complaint.complaint_complemento,
            descricao: complaint.complaint_descricao,
            status: complaint.complaint_status,
            imageUrl: complaint.complaint_imageUrl,
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            user: {
              id: complaint.user_id,
              nome: complaint.user_nome,
              telefone: complaint.user_telefone,
              email: complaint.user_email,
              role: complaint.user_role,
            },
          };
        }
        return null;
      })
      .filter((complaint) => complaint !== null);
  }

  async findOne(id: number): Promise<any> {
    const complaint = await this.complaintRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.user', 'user')
      .where('complaint.id = :id', { id })
      .select([
        'complaint.id',
        'complaint.setor',
        'complaint.endereco',
        'complaint.complemento',
        'complaint.descricao',
        'complaint.status',
        'complaint.imageUrl',
        'user.id',
        'user.nome',
        'user.telefone',
        'user.email',
        'user.role',
      ])
      .addSelect('ST_AsText(complaint.location)', 'locationText')
      .getRawOne();

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    const match = complaint.locationText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      const longitude = parseFloat(match[1]);
      const latitude = parseFloat(match[2]);
      return {
        id: complaint.complaint_id,
        setor: complaint.complaint_setor,
        endereco: complaint.complaint_endereco,
        complemento: complaint.complaint_complemento,
        descricao: complaint.complaint_descricao,
        status: complaint.complaint_status,
        imageUrl: complaint.complaint_imageUrl,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },

        user: {
          id: complaint.user_id,
          nome: complaint.user_nome,
          telefone: complaint.user_telefone,
          email: complaint.user_email,
          role: complaint.user_role,
        },
      };
    }
    return complaint;
  }

  async update(id: number, updateComplaintDto: UpdateComplaintDto) {
    const updateResult = await this.complaintRepository.update(
      id,
      updateComplaintDto,
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException();
    }

    return this.complaintRepository.findOne({ where: { id: id } });
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateComplaintStatusDto,
  ): Promise<Complaint> {
    const complaint = await this.complaintRepository.findOne({ where: { id } });

    if (!complaint) {
      throw new NotFoundException();
    }

    complaint.status = updateStatusDto.status;
    await this.complaintRepository.save(complaint);

    return complaint;
  }

  async remove(id: number) {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException();
    }

    return this.complaintRepository.remove(complaint);
  }

  async checkOwnership(complaintId: number, userId: number): Promise<boolean> {
    const complaint = await this.complaintRepository.findOne({
      where: { id: complaintId, user: { id: userId } },
    });
    return complaint ? true : false;
  }

  async moveFileToPermanentLocation(
    file: Express.Multer.File,
  ): Promise<string> {
    const permanentDir = './upload/permanent';
    const finalPath = path.join(permanentDir, file.filename);

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
