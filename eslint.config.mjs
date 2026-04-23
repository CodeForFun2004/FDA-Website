import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: ['**/.next/**', '**/node_modules/**', '**/dist/**', '**/out/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin
    },
    rules: {
      // keep similar behavior to old .eslintrc.json (mostly warn)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      // TypeScript already checks undefined identifiers; this rule is noisy in TS/Next apps
      'no-undef': 'off',
      // relax a few JS-recommended rules that are noisy in TS-heavy codebases
      'no-redeclare': 'off',
      'no-useless-assignment': 'off',
      'no-empty-pattern': 'off',
      'no-useless-escape': 'off',
      'preserve-caught-error': 'off',
      'no-console': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'warn'
    }
  }
];

