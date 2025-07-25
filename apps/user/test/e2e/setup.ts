// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from '../../src/app.module';
// import { INestApplication } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import { UserMicroService } from '@app/common';
// import { UserEntity } from '../../src/entities/user.entity';

// let moduleFixture: TestingModule;
// let app: INestApplication;
// let dataSource: DataSource;
// let users: UserEntity[];

// describe('UserMicroService E2E', () => {
//     beforeAll(async () => {
//         moduleFixture = await Test.createTestingModule({
//             imports: [AppModule],
//             providers: [],
//         }).compile();

//         app = moduleFixture.createNestApplication();
//         await app.init();

//         dataSource = moduleFixture.get<DataSource>(DataSource);
//     });

//     beforeAll(async () => {
//         await dataSource.getRepository(UserEntity).delete({});

//         users = Array.from({ length: 10 }).map((_, i) => {
//             const user = new UserEntity();
//             user.id = i + 1;
//             user.email = `test${i + 1}@test.com`;
//             user.provider = 'google';
//             user.providerId = `test${i + 1}`;
//             user.name = `test${i + 1}`;
//             user.avatarUrl = `https://test${i + 1}.com`;
//             user.role = UserMicroService.UserRole.USER;
//             user.emailVerified = true;

//             return dataSource.getRepository(UserEntity).create(user);
//         });

//         await dataSource.getRepository(UserEntity).save(users);
//     });

//     afterAll(async () => {
//         await app.close();
//         await dataSource.destroy();
//     });
// });

// export const getModuleFixture = () => moduleFixture;
// export const getApp = () => app;
// export const getDataSource = () => dataSource;
// export const getUsers = () => users;
