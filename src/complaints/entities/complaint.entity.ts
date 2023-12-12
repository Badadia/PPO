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
  tipo: ComplaintType;

  @Column()
  endereco: string;

  @Column()
  descricao: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column()
  status: ComplaintStatus;

  @ManyToOne(() => User)
  user: User;
}