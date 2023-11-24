import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ServiceType } from '../dto/serviceType.enum';
import { User } from 'src/users/entities/user.entity';

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

  @Column()
  location: string;

  @ManyToOne(() => User)
  user: User;
}
