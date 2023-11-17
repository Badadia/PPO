import { Role } from 'src/users/roles/roles.enum';

export interface JwtPayload {
  sub: number;
  nome: string;
  role: Role;
}
