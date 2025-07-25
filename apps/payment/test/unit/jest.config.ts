import type { Config } from 'jest';

const config: Config = {
    displayName: 'payment-unit',
    rootDir: '../..',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    testMatch: ['<rootDir>/test/unit/*.spec.ts'],
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
    coverageDirectory: '../../coverage/apps/payment/unit',
    moduleNameMapper: {
        '^@app/common(.*)$': '<rootDir>/../../libs/common/src$1',
    },
};

export default config;
