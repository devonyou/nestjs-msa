import type { Config } from 'jest';

const config: Config = {
    displayName: 'payment',
    rootDir: '.',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    testMatch: ['<rootDir>/**/*.spec.ts'],
    collectCoverageFrom: [
        '<rootDir>/**/*.{ts,js}',
        '!<rootDir>/**/*controller.ts',
        '!<rootDir>/**/*main.ts',
        '!<rootDir>/**/*module.ts',
        '!<rootDir>/**/*entity.ts',
        '!<rootDir>/**/*dto.ts',
        '!<rootDir>/**/*config.ts',
        '!<rootDir>/**/*schema.ts',
        '!<rootDir>/**/*mapper.ts',
        '!<rootDir>/**/*client.ts',
        '!<rootDir>/**/*spec.ts',
    ],
    coverageDirectory: '../../coverage/apps/payment',
    moduleNameMapper: {
        // '@/(.*)': '<rootDir>/src/$1',
        '^@app/common(.*)$': '<rootDir>/../../libs/common/src$1',
    },
};

export default config;
