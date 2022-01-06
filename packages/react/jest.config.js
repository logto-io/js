module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  testPathIgnorePatterns: ['lib'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  coverageReporters: ['json', 'html', 'text-summary', 'lcov'],
};
