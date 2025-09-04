module.exports = {
    // 🎨 기본 포맷팅 규칙
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,

    // 📝 HTML 및 템플릿 포맷팅
    htmlWhitespaceSensitivity: 'ignore',
    embeddedLanguageFormatting: 'auto',

    // 🔧 줄바꿈 설정
    endOfLine: 'crlf', // Windows 환경

    // 📂 파일별 설정
    overrides: [
        {
            files: '*.html',
            options: {
                printWidth: 120,
                tabWidth: 4,
            },
        },
        {
            files: '*.css',
            options: {
                printWidth: 80,
                singleQuote: false,
            },
        },
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
