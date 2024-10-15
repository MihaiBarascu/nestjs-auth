import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entites/role.entity';
import { User } from 'src/entites/user.entity';
import { Permission } from 'src/entites/permission.entity';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configSerive: ConfigService,
      ) => ({
        type: 'mysql',
        host: configSerive.get<string>('DB_HOST'),
        port: configSerive.get<number>('DB_PORT'),
        username: configSerive.get<string>(
          'DB_USERNAME',
        ),
        password: configSerive.get<string>(
          'DB_PASSWORD',
        ),
        database:
          configSerive.get<string>('DB_NAME'),
        entities: [User, Role, Permission],
        synchronize: true,
      }),
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
