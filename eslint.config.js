const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores([
    '.agents/**',
    '.specify/**',
    'docs/**',
    'specs/**',
    'node_modules/**',
    '.expo/**',
    '.test-build/**',
    '.artifacts/**',
    'dist/**',
    'build/**',
    'coverage/**',
  ]),
  expoConfig,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
]);
