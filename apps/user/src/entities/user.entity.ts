import { UserMicroService } from '@app/common';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';

@Entity('user')
@Unique(['providerId'])
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: UserMicroService.UserRole.USER,
        type: 'enum',
        enum: UserMicroService.UserRole,
        nullable: false,
    })
    role: UserMicroService.UserRole;

    @Column()
    provider: string;

    @Column()
    providerId: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'bool', default: false })
    emailVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @VersionColumn()
    version: number;
}
