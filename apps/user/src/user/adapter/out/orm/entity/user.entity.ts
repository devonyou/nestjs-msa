import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    VersionColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    age: number;

    @Column()
    name: string;

    @Column()
    profile: string;

    @Column({ select: false })
    password: string;

    @CreateDateColumn()
    cretedAt: Date;

    @CreateDateColumn()
    udpatedAt: Date;

    @VersionColumn()
    version: number;
}
