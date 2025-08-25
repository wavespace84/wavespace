import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // 정적 사이트를 위한 멀티 페이지 설정
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                attendance: resolve(__dirname, 'attendance.html'),
                events: resolve(__dirname, 'events.html'),
                forum: resolve(__dirname, 'forum.html'),
                headhunting: resolve(__dirname, 'headhunting.html'),
                'hall-of-fame': resolve(__dirname, 'hall-of-fame.html'),
                humor: resolve(__dirname, 'humor.html'),
                'market-research': resolve(__dirname, 'market-research.html'),
                notice: resolve(__dirname, 'notice.html'),
                'planning-recruitment': resolve(__dirname, 'planning-recruitment.html'),
                'plus-membership': resolve(__dirname, 'plus-membership.html'),
                qna: resolve(__dirname, 'qna.html'),
                'sales-recruit': resolve(__dirname, 'sales-recruit.html'),
                support: resolve(__dirname, 'support.html'),
                updates: resolve(__dirname, 'updates.html'),
            },
        },
        // 청크 크기 최적화
        chunkSizeWarningLimit: 1000,
        // CSS 코드 분할
        cssCodeSplit: true,
        // 소스맵 생성 (개발용)
        sourcemap: process.env.NODE_ENV === 'development',
    },

    // 개발 서버 설정
    server: {
        port: 3000,
        host: true, // 네트워크 접근 허용
        open: true, // 자동 브라우저 오픈
        cors: true,
    },

    // 에셋 처리
    assetsInclude: ['**/*.md'],

    // CSS 전처리
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            css: {
                charset: false,
            },
        },
    },

    // 모듈 해석 설정
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            '@js': resolve(__dirname, './js'),
            '@css': resolve(__dirname, './css'),
            '@components': resolve(__dirname, './components'),
        },
    },

    // 플러그인 (필요시 확장)
    plugins: [],

    // 환경 변수
    define: {
        __DEV__: process.env.NODE_ENV === 'development',
    },
});
