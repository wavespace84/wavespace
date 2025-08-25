#!/usr/bin/env node

/**
 * WAVE SPACE 성능 체크 스크립트
 * 빌드 결과물의 성능을 분석합니다.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const DIST_DIR = './dist';
const MAX_FILE_SIZE = {
    html: 50 * 1024, // 50KB
    css: 100 * 1024, // 100KB
    js: 200 * 1024, // 200KB
    total: 2 * 1024 * 1024, // 2MB
};

console.log('📊 WAVE SPACE 성능 분석을 시작합니다...\n');

// 파일 크기 분석
function analyzeFileSize(dir, results = { files: [], totalSize: 0 }) {
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            analyzeFileSize(fullPath, results);
        } else {
            const size = stat.size;
            const ext = extname(item).toLowerCase();

            results.files.push({
                path: fullPath.replace('./dist/', ''),
                size,
                ext,
                sizeKB: (size / 1024).toFixed(2),
            });

            results.totalSize += size;
        }
    }

    return results;
}

// 성능 경고 체크
function checkPerformanceWarnings(files) {
    const warnings = [];

    for (const file of files) {
        const { path, size, ext } = file;
        const maxSize = MAX_FILE_SIZE[ext.replace('.', '')];

        if (maxSize && size > maxSize) {
            warnings.push({
                file: path,
                issue: `${ext.toUpperCase()} 파일이 권장 크기를 초과했습니다`,
                current: `${(size / 1024).toFixed(2)}KB`,
                recommended: `${(maxSize / 1024).toFixed(2)}KB`,
            });
        }
    }

    return warnings;
}

// 코어 웹 바이탈 체크 (기본 분석)
function analyzeCoreWebVitals(files) {
    const analysis = {
        htmlFiles: files.filter((f) => f.ext === '.html').length,
        cssFiles: files.filter((f) => f.ext === '.css').length,
        jsFiles: files.filter((f) => f.ext === '.js').length,
        imageFiles: files.filter((f) =>
            ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(f.ext)
        ).length,
    };

    const recommendations = [];

    if (analysis.cssFiles > 5) {
        recommendations.push('CSS 파일이 많습니다. CSS 번들링을 고려해보세요.');
    }

    if (analysis.jsFiles > 10) {
        recommendations.push('JavaScript 파일이 많습니다. 코드 분할을 고려해보세요.');
    }

    const largeImages = files.filter(
        (f) => ['.jpg', '.jpeg', '.png'].includes(f.ext) && f.size > 500 * 1024
    );

    if (largeImages.length > 0) {
        recommendations.push(
            `큰 이미지 파일이 ${largeImages.length}개 있습니다. 압축을 고려해보세요.`
        );
    }

    return { analysis, recommendations };
}

// 빌드 품질 점수 계산
function calculateQualityScore(files, warnings, totalSize) {
    let score = 100;

    // 파일 크기 점수 (30점)
    const sizePenalty = Math.min(30, (totalSize / MAX_FILE_SIZE.total) * 30);
    score -= sizePenalty;

    // 경고 점수 (40점)
    const warningPenalty = Math.min(40, warnings.length * 10);
    score -= warningPenalty;

    // 파일 구조 점수 (30점)
    const htmlCount = files.filter((f) => f.ext === '.html').length;
    const cssCount = files.filter((f) => f.ext === '.css').length;
    const jsCount = files.filter((f) => f.ext === '.js').length;

    if (htmlCount < 5) score -= 5; // 너무 적은 페이지
    if (cssCount > 20) score -= 10; // 너무 많은 CSS 파일
    if (jsCount > 30) score -= 15; // 너무 많은 JS 파일

    return Math.max(0, Math.round(score));
}

// 메인 분석 함수
function performanceAnalysis() {
    try {
        console.log('🏗️ 빌드 실행 중...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log('📁 파일 분석 중...');
        const results = analyzeFileSize(DIST_DIR);
        const warnings = checkPerformanceWarnings(results.files);
        const { analysis, recommendations } = analyzeCoreWebVitals(results.files);
        const qualityScore = calculateQualityScore(results.files, warnings, results.totalSize);

        // 결과 출력
        console.log('\n📊 === 성능 분석 결과 ===\n');

        // 전체 통계
        console.log('📈 전체 통계:');
        console.log(`  총 파일 수: ${results.files.length}개`);
        console.log(`  총 크기: ${(results.totalSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  품질 점수: ${qualityScore}/100`);
        console.log('');

        // 파일 유형별 분석
        console.log('📋 파일 유형별 분석:');
        console.log(`  HTML: ${analysis.htmlFiles}개`);
        console.log(`  CSS: ${analysis.cssFiles}개`);
        console.log(`  JavaScript: ${analysis.jsFiles}개`);
        console.log(`  이미지: ${analysis.imageFiles}개`);
        console.log('');

        // 큰 파일들 표시
        const largeFiles = results.files.sort((a, b) => b.size - a.size).slice(0, 10);

        console.log('📦 가장 큰 파일들:');
        for (const file of largeFiles) {
            console.log(`  ${file.path}: ${file.sizeKB}KB`);
        }
        console.log('');

        // 경고사항
        if (warnings.length > 0) {
            console.log('⚠️  성능 경고:');
            for (const warning of warnings) {
                console.log(`  ${warning.file}: ${warning.issue}`);
                console.log(`    현재: ${warning.current}, 권장: ${warning.recommended}`);
            }
            console.log('');
        }

        // 권장사항
        if (recommendations.length > 0) {
            console.log('💡 개선 권장사항:');
            for (const rec of recommendations) {
                console.log(`  • ${rec}`);
            }
            console.log('');
        }

        // 결론
        if (qualityScore >= 90) {
            console.log('🎉 훌륭합니다! 성능 최적화가 잘 되어 있습니다.');
        } else if (qualityScore >= 70) {
            console.log('👍 양호합니다. 몇 가지 개선사항이 있습니다.');
        } else {
            console.log('🔧 성능 개선이 필요합니다. 위의 권장사항을 검토해보세요.');
        }
    } catch (error) {
        console.error('❌ 성능 분석 중 오류가 발생했습니다:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    performanceAnalysis();
}
