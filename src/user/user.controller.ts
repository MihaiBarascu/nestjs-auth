import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {
  @UseGuards(AccessTokenGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }
}
