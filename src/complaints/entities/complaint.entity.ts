import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ComplaintType } from '../dto/complaintType.enum';
import { User } from 'src/users/entities/user.entity';
import { Point } from 'geojson';
import { ComplaintStatus } from '../dto/complaintStatus.enum';

@Entity()
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  setor: ComplaintType;

  @Column()
  endereco: string;

  @Column({ nullable: true })
  complemento: string;

  @Column()
  descricao: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
  })
  location: Point;

  @Column()
  status: ComplaintStatus;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;
}
