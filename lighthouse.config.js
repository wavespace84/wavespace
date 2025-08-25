module.exports = {
    ci: {
        collect: {
            // 분석할 URL 목록 (로컬 서버 기준)
            url: [
                'http://localhost:3000/',
                'http://localhost:3000/attendance.html',
                'http://localhost:3000/events.html',
                'http://localhost:3000/forum.html',
                'http://localhost:3000/headhunting.html',
                'http://localhost:3000/hall-of-fame.html',
                'http://localhost:3000/humor.html',
                'http://localhost:3000/market-research.html',
                'http://localhost:3000/notice.html',
                'http://localhost:3000/planning-recruitment.html',
                'http://localhost:3000/plus-membership.html',
                'http://localhost:3000/qna.html',
                'http://localhost:3000/sales-recruit.html',
                'http://localhost:3000/support.html',
                'http://localhost:3000/updates.html',
            ],
            startServerCommand: 'npm run preview',
            startServerReadyPattern: 'Local:',
            startServerReadyTimeout: 10000,
        },
        upload: {
            // GitHub에서 결과 확인을 위한 임시 서버 설정
            target: 'temporary-public-storage',
        },
        assert: {
            // 성능 임계값 설정
            assertions: {
                // Core Web Vitals
                'categories:performance': ['error', { minScore: 0.8 }],
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:best-practices': ['error', { minScore: 0.8 }],
                'categories:seo': ['error', { minScore: 0.9 }],

                // 구체적 메트릭
                'metrics:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
                'metrics:first-contentful-paint': ['error', { maxNumericValue: 1800 }],
                'metrics:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'metrics:total-blocking-time': ['error', { maxNumericValue: 200 }],

                // 리소스 최적화
                'metrics:interactive': ['warn', { maxNumericValue: 3000 }],
                'metrics:speed-index': ['warn', { maxNumericValue: 2500 }],

                // 접근성
                'audits:color-contrast': 'error',
                'audits:heading-order': 'error',
                'audits:alt-text': 'error',
                'audits:label': 'error',

                // 모범 사례
                'audits:uses-https': 'error',
                'audits:uses-text-compression': 'warn',
                'audits:render-blocking-resources': 'warn',
                'audits:unused-css-rules': 'warn',
                'audits:unused-javascript': 'warn',

                // SEO
                'audits:meta-description': 'warn',
                'audits:document-title': 'error',
                'audits:lang': 'error',
                'audits:viewport': 'error',
            },
        },
    },
};
