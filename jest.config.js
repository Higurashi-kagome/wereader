module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/test/**/*'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    // 限制并发workers数量以避免Node.js版本兼容性问题
    maxWorkers: '50%'
}
