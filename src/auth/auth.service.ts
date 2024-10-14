import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto } from './dto';
import { User } from 'src/entites/user.entity';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    const user = this.userRepository.create({
      email: dto.email,
      hash,
    });

    await this.userRepository.save(user);
    delete user.hash;

    return user;
  }
}
