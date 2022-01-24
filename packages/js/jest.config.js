module.exports = {
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  coverageReporters: ['text-summary', 'lcov'],
  moduleFileExtensions: ['ts', 'js'],
  setupFilesAfterEnv: ['./jest.setup.js', 'jest-matcher-specific-error'],
  testPathIgnorePatterns: ['lib'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|js)$',
  transform: {
    '.ts': 'ts-jest',
  },
};
