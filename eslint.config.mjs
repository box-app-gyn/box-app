import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    ignores: [
      '**/._*',
      '**/.__*',
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**'
    ]
  }
]

export default eslintConfig 