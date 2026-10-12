import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default tseslint.config(
 { ignores: ['dist/**','node_modules/**','test-build/**','*.config.*'] },
 js.configs.recommended,
 ...tseslint.configs.recommended,
 { files: ['src/**/*.{ts,tsx}'], languageOptions: { globals: {...globals.browser}, parserOptions: { ecmaFeatures: {jsx:true} } }, plugins: {react,'react-hooks':hooks}, rules: {
  '@typescript-eslint/no-explicit-any':'off', '@typescript-eslint/no-unused-vars':'off', 'no-unused-vars':'off',
  'react/jsx-no-duplicate-props':'error', 'react/jsx-key':'error', 'react-hooks/rules-of-hooks':'error',
 } },
);
