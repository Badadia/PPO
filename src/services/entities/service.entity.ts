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

  @Column()
  descricao: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column()
  status: ServiceStatus;

  @ManyToOne(() => User)
  user: User;
}
