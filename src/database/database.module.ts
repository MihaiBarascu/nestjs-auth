import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entites/role.entity';
import { User } from 'src/entites/user.entity';
import { Permission } from 'src/entites/permission.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: 'root',
      database: 'dev_db2',
      entities: [User, Role, Permission],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
