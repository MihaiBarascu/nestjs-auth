import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityNotFoundError,
  Repository,
} from 'typeorm';
import { AuthDto } from './dto';
import { User } from 'src/entites/user.entity';
import * as argon from 'argon2';
import { QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = this.userRepository.create({
        email: dto.email,
        hash,
      });

      await this.userRepository.save(user);

      delete user.hash;

      return user;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('Duplicate')
      ) {
        throw new ForbiddenException(
          'Credentials taken',
        );
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    try {
      const user =
        await this.userRepository.findOne({
          where: {
            email: dto.email,
          },
          relations: {
            roles: {
              permissions: true,
            },
          },
        });

      const pwMatches = await argon.verify(
        user.hash,
        dto.password,
      );
      if (!pwMatches) {
        throw new ForbiddenException(
          'Credentials incorrect',
        );
      }

      const roles = user.roles.map(
        (role) => role.id,
      );
      const permissions = user.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) => permission.id,
          ),
      );

      return this.signAccessToken(
        user.uuid,
        user.email,
        roles,
        permissions,
      );
    } catch (error) {
      if (
        error instanceof EntityNotFoundError &&
        error.message.includes(
          'not find any entity',
        )
      ) {
        throw new ForbiddenException(
          'Credentials incorrect',
        );
      }
      throw error;
    }
  }
  async signAccessToken(
    userUuid: string,
    email: string,
    roles: number[],
    permissions: number[],
  ): Promise<{ access_token: string }> {
    const palyLoad = {
      sub: userUuid,
      email,
      roles,
      permissions,
    };
    const secret = this.config.get(
      'ACCESS_TOKEN_SECRET',
    );

    const token = await this.jwt.signAsync(
      palyLoad,
      {
        expiresIn: '15m',
        secret,
      },
    );

    return {
      access_token: token,
    };
  }
}
