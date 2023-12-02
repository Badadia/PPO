import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ComplaintType } from '../dto/complaintType.enum';
import { User } from 'src/users/entities/user.entity';

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

  @Column()
  location: string;

  @ManyToOne(() => User)
  user: User;
}
