module.exports = {
  extends: ['../.eslintrc.cjs', 'plugin:vue/vue3-recommended', '@vue/eslint-config-typescript'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/no-v-html': 'off'
  }
}
