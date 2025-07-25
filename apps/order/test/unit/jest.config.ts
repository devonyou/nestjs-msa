import type { Config } from 'jest';

const config: Config = {
    displayName: 'order-unit',
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
        '!<rootDir>/**/*strategy.ts',
        '!<rootDir>/**/*spec.ts',
        '!<rootDir>/**/setup.ts',
        '!<rootDir>/**/*mapper.ts',
        '!<rootDir>/**/*client.ts',
        '!<rootDir>/**/order.payment.service.ts',
        '!<rootDir>/**/order.product.service.ts',
        '!<rootDir>/**/order.notification.service.ts',
    ],
    coverageDirectory: '../../coverage/apps/order/unit',
    moduleNameMapper: {
        '^@app/common(.*)$': '<rootDir>/../../libs/common/src$1',
    },
};

export default config;
