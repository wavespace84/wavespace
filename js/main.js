// main.js - 메인 자바스크립트 파일

import { initSidebar } from './modules/sidebar.js';
import { initHeader } from './modules/header.js';
import { initPreload } from './modules/preload.js';
import { initClock } from './modules/clock.js';

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 프리로드 초기화
    initPreload();
    
    // 사이드바 초기화
    initSidebar();
    
    // 헤더 초기화
    initHeader();
    
    // 시계 초기화
    initClock();
    
    // 페이지별 초기화
    const currentPage = document.body.dataset.page;
    if (currentPage) {
        import(`./pages/${currentPage}.js`)
            .then(module => {
                if (module.init) {
                    module.init();
                }
            })
            .catch(err => {
                console.error(`Failed to load page module: ${currentPage}`, err);
            });
    }
});