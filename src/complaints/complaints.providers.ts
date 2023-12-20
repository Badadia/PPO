import { DataSource } from 'typeorm';
import { Complaint } from './entities/complaint.entity';

export const complaintsProviders = [
  {
    provide: 'COMPLAINTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Complaint),
    inject: ['DATA_SOURCE'],
  },
];
