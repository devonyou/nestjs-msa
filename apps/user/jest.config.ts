import type { Config } from 'jest';

const config: Config = {
    displayName: 'user',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    testMatch: ['**/*.spec.ts'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
    coverageDirectory: '../../coverage/apps/user',
};

export default config;
