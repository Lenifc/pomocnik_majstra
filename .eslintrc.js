module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    parserOptions: {
        parser: '@babel/eslint-parser',
        requireConfigFile: false,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['import'],
    // add your custom rules here
    rules: {
        'no-nested-ternary': 2,
        'vue/no-unused-components': 'warn',
        'import/no-named-as-default': 0,
        'prefer-promise-reject-errors': 0,
        'vue/custom-event-name-casing': ['error', 'kebab-case'],
        'vue/v-on-event-hyphenation': ['error'],
        'vue/multi-word-component-names': 'off',
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [['@', './']],
                extensions: ['.vue', '.js'],
            },
        },
    },
}
