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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
        await this.userRepository.findOneByOrFail(
          {
            email: dto.email,
          },
        );

      return user;
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
    }
  }
}
