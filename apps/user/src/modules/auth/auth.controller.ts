import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    signInWithGoogle() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    signInWithGoogleCallback(@Req() req: Request) {
        return this.userService.signInWithGoogle(req.user as unknown as UserEntity);
    }
}
