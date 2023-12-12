import {
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

@Injectable()
export class ComplaintsService {
  constructor(
    @Inject('COMPLAINTS_REPOSITORY')
    private readonly complaintRepository: Repository<Complaint>,
  ) {}

  async create(
    createComplaintDto: CreateComplaintDto,
    userId: number,
  ): Promise<Complaint> {
    const complaint = await this.complaintRepository.create(createComplaintDto);

    const user = new User();
    user.id = userId;
    complaint.user = user;
    complaint.status = ComplaintStatus.Pendente;

    await this.complaintRepository.save(complaint);
    return complaint;
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
      throw new NotFoundException(`Complaint ID ${id} not found`);
    }
    return complaint;
  }

  async update(id: number, updateComplaintDto: UpdateComplaintDto) {
    const updateResult = await this.complaintRepository.update(
      id,
      updateComplaintDto,
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Complaint ID ${id} not found`);
    }

    return this.complaintRepository.findOne({ where: { id: id } });
  }

  async remove(id: number) {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint ID ${id} not found`);
    }

    return this.complaintRepository.remove(complaint);
  }

  async checkOwnership(complaintId: number, userId: number): Promise<boolean> {
    const complaint = await this.complaintRepository.findOne({
      where: { id: complaintId, user: { id: userId } },
    });
    return complaint ? true : false;
  }
}
