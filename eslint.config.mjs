import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier/flat';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/cdk.out/**',
      '**/next-env.d.ts',
      '.npm-cache/**',
      '.cache/**',
      'tmp/**',
      'test-results/**',
      'playwright-report/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { '@next/next': next, 'react-hooks': reactHooks },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  { settings: { next: { rootDir: 'apps/web/' } } },
  {
    files: ['**/*.{mjs,ts,tsx}'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
  },
  prettier,
];
