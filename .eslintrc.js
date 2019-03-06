const [OFF, WARN, ERROR] = [0, 1, 2];

module.exports = {
  extends: ['eslint-config-airbnb-base', 'eslint-config-prettier'],
  plugins: ['eslint-plugin-prettier'],
  rules: {
    strict: OFF,
    'no-console': OFF,
    'prettier/prettier': ERROR,
  },
};
