import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Role } from '../roles/roles.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  telefone: number;

  @Column()
  email: string;

  @Column()
  role: Role;

  @Exclude({ toPlainOnly: true })
  @Column()
  senha: string;
}
