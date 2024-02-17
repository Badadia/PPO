import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ServiceType } from '../dto/serviceType.enum';
import { User } from 'src/users/entities/user.entity';
import { Point } from 'geojson';
import { ServiceStatus } from '../dto/serviceStatus.enum';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: ServiceType;

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
  status: ServiceStatus;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
