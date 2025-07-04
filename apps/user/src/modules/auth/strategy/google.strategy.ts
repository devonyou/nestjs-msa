import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../../user/user.service';
import { GoogleProfileDto } from '../../user/dto/google.profile.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private readonly logger = new Logger(GoogleStrategy.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow<string>('GOOGLE_AUTH_CALLBACK_URL'),
            // passReqToCallback: true,
            scope: ['email', 'profile'],
        });
    }

    authorizationParams(): { [key: string]: string } {
        return {
            access_type: 'offline',
            prompt: 'select_account',
        };
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
        const userInfo: GoogleProfileDto = {
            provider: profile?.provider,
            providerId: profile?._json?.sub,
            email: profile?._json?.email,
            name: profile?._json?.name,
            avatarUrl: profile?._json?.picture,
            emailVerified: profile?._json?.email_verified,
        };

        try {
            const user = await this.userService.findOrCreateUserByGoogle(userInfo);
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}
