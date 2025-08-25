module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    plugins: ['html'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        // 🧹 코드 품질 규칙
        'max-lines-per-function': ['warn', { max: 50 }],
        complexity: ['warn', 10],
        'max-params': ['error', 4],
        'no-magic-numbers': ['warn', { ignore: [-1, 0, 1, 2, 100, 1000] }],

        // 🚨 보안 규칙
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-script-url': 'error',

        // ✨ 코딩 컨벤션
        camelcase: ['error', { properties: 'always' }],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'warn',

        // 🔧 코드 스타일
        indent: ['error', 4],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    globals: {
        WaveSpaceData: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        '*.min.js',
        'jobkorea_css/',
        'saramin_css/',
        'mcp-servers/',
    ],
};
