import eslintConfig from '@electron-toolkit/eslint-config-ts';

export default eslintConfig.config(...eslintConfig.configs.recommended, {
  ignores: ['out/**', 'node_modules/**'],
});
