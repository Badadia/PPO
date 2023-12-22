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

  async findAll() {
    return this.complaintRepository.find();
  }

  async findOwnerComplaints(
    userId: number,
    authenticatedUser: User,
  ): Promise<Complaint[]> {
    if (userId !== authenticatedUser.id && authenticatedUser.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar essas denúncias.',
      );
    }
    return this.complaintRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: number) {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException();
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
