import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(dto: CreateUserDto) {
        const { email, password } = dto;
        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        });
        if (user) throw new BadRequestException('Already user email');

        const hash = await bcrypt.hash(password, 10);

        await this.userRepository.save({
            ...dto,
            password: hash,
        });

        return await this.userRepository.findOne({ where: { email } });
    }

    async getUserById(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('Not found user by userid');
        return user;
    }
}
