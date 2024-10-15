import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { User } from 'src/entites/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  // @InjectRepository(User)
  // private readonly userRepository: Repository<User>,

  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get(
        'ACCESS_TOKEN_SECRET',
      ),
    });
  }
  async validate(payload: {
    sub: string;
    email: string;
    roles: number[];
    permissions: number[];
    uuid: string;
  }) {
    const user =
      await this.userRepository.findOneOrFail({
        where: {
          uuid: payload.sub,
        },
        relations: {
          roles: {
            permissions: true,
          },
        },
      });
    delete user.hash;
    return {
      tokenPayload: payload,
      userFromDb: user,
    };
  }
}
