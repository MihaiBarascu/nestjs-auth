import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: AuthDto) {
    return await this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: AuthDto) {
    return await this.authService.signin(dto);
  }
}
