/** @type {import('ts-jest').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testMatch: [
    '**/src/**/*.+(test.ts)?(x)',
  ],
  rootDir: './src',
  globals: {
    'ts-jest': {
        tsconfig: './tsconfig.json',
        isolatedModules: true
    }
  }
};
