import type { Config } from 'jest';

const config: Config = {
    displayName: 'user-e2e',
    rootDir: '../..',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    testMatch: ['<rootDir>/test/e2e/*.spec.ts'],
    collectCoverageFrom: ['<rootDir>/**/*.{ts,js}'],
    coverageDirectory: '../../coverage/apps/user/e2e',
    moduleNameMapper: {
        '^@app/common(.*)$': '<rootDir>/../../libs/common/src$1',
    },
    setupFilesAfterEnv: ['<rootDir>/test/e2e/setup.ts'],
    testTimeout: 30000,
};

export default config;
