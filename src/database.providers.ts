import { DataSource } from 'typeorm';
import { UserRefactoring1686604795500 } from './migrations/1686604795500-CourseRefactoring';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Bryanbelo19',
        database: 'postgres',
        entities: [__dirname + '/../**/*.entity.js'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Bryanbelo19',
  database: 'postgres',
  entities: [__dirname + '/../**/*.entity.js'],
  synchronize: true,
  migrations: [UserRefactoring1686604795500],
});
