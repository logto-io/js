module.exports = {
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  coverageReporters: ['text-summary', 'lcov'],
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['lib'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|js)$',
  transform: {
    '.ts': 'ts-jest',
  },
};
