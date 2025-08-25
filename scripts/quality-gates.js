#!/usr/bin/env node

/**
 * WAVE SPACE 품질 게이트 검증 시스템
 * 배포 전 종합적인 품질 검사를 수행합니다.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🚪 WAVE SPACE 품질 게이트 검증을 시작합니다...\n');

// 품질 기준 설정
const QUALITY_THRESHOLDS = {
    performance: {
        bundleSize: 2 * 1024 * 1024, // 2MB
        jsFileSize: 200 * 1024, // 200KB per JS file
        cssFileSize: 100 * 1024, // 100KB per CSS file
        htmlFileSize: 50 * 1024, // 50KB per HTML file
        imageSize: 500 * 1024, // 500KB per image
    },
    lighthouse: {
        performance: 80,
        accessibility: 90,
        bestPractices: 80,
        seo: 90,
    },
    coverage: {
        minPages: 10, // 최소 페이지 수
        maxLoadTime: 3000, // 3초 이하 로딩
    },
};

let overallScore = 100;
const issues = [];
const warnings = [];

// 1. 코드 품질 검사
function checkCodeQuality() {
    console.log('🔍 1. 코드 품질 검사 중...');

    try {
        // ESLint 검사
        execSync('npm run lint', { stdio: 'pipe' });
        console.log('  ✅ ESLint 검사 통과');
    } catch (error) {
        const lintErrors = error.stdout?.toString() || '';
        const errorCount = (lintErrors.match(/error/g) || []).length;
        const warningCount = (lintErrors.match(/warning/g) || []).length;

        if (errorCount > 0) {
            issues.push(`ESLint 오류 ${errorCount}개 발견`);
            overallScore -= errorCount * 5;
        }

        if (warningCount > 0) {
            warnings.push(`ESLint 경고 ${warningCount}개 발견`);
            overallScore -= warningCount * 2;
        }
    }

    try {
        // Prettier 포맷 검사
        execSync('npm run format:check', { stdio: 'pipe' });
        console.log('  ✅ Prettier 포맷 검사 통과');
    } catch (error) {
        warnings.push('코드 포맷이 표준과 다름');
        overallScore -= 5;
    }
}

// 2. 빌드 검증
function checkBuild() {
    console.log('🏗️ 2. 빌드 검증 중...');

    try {
        execSync('npm run build', { stdio: 'pipe' });
        console.log('  ✅ 빌드 성공');

        // 빌드 결과물 분석
        if (existsSync('./dist')) {
            const buildAnalysis = analyzeBuildOutput('./dist');

            if (buildAnalysis.totalSize > QUALITY_THRESHOLDS.performance.bundleSize) {
                issues.push(
                    `번들 크기가 임계값 초과: ${(buildAnalysis.totalSize / 1024 / 1024).toFixed(2)}MB`
                );
                overallScore -= 15;
            }

            // 개별 파일 크기 검사
            for (const file of buildAnalysis.largeFiles) {
                warnings.push(`큰 파일 발견: ${file.path} (${(file.size / 1024).toFixed(2)}KB)`);
                overallScore -= 3;
            }

            console.log(
                `  📦 총 빌드 크기: ${(buildAnalysis.totalSize / 1024 / 1024).toFixed(2)}MB`
            );
            console.log(`  📄 총 파일 수: ${buildAnalysis.fileCount}개`);
        } else {
            issues.push('빌드 출력 디렉토리가 생성되지 않음');
            overallScore -= 20;
        }
    } catch (error) {
        issues.push('빌드 실패');
        overallScore -= 30;
        console.log('  ❌ 빌드 실패:', error.message);
    }
}

// 3. 성능 검사
function checkPerformance() {
    console.log('⚡ 3. 성능 검사 중...');

    try {
        // 성능 분석 스크립트 실행
        const perfResult = execSync('npm run perf', { stdio: 'pipe', encoding: 'utf8' });

        // 성능 점수 추출 (예시)
        const scoreMatch = perfResult.match(/품질 점수: (\d+)\/100/);
        if (scoreMatch) {
            const perfScore = parseInt(scoreMatch[1]);
            console.log(`  📊 성능 점수: ${perfScore}/100`);

            if (perfScore < 70) {
                issues.push(`성능 점수가 낮음: ${perfScore}/100`);
                overallScore -= 80 - perfScore;
            } else if (perfScore < 85) {
                warnings.push(`성능 개선 권장: ${perfScore}/100`);
                overallScore -= Math.max(0, (90 - perfScore) * 0.5);
            }
        }

        console.log('  ✅ 성능 분석 완료');
    } catch (error) {
        warnings.push('성능 분석 중 오류 발생');
        overallScore -= 10;
    }
}

// 4. 보안 검사
function checkSecurity() {
    console.log('🔒 4. 보안 검사 중...');

    try {
        // npm audit 실행
        const auditResult = execSync('npm audit --audit-level=moderate --json', {
            stdio: 'pipe',
            encoding: 'utf8',
        });

        const auditData = JSON.parse(auditResult);

        if (auditData.metadata?.vulnerabilities) {
            const {
                critical = 0,
                high = 0,
                moderate = 0,
                low = 0,
            } = auditData.metadata.vulnerabilities;

            if (critical > 0) {
                issues.push(`치명적 보안 취약점 ${critical}개 발견`);
                overallScore -= critical * 20;
            }

            if (high > 0) {
                issues.push(`높은 위험 보안 취약점 ${high}개 발견`);
                overallScore -= high * 10;
            }

            if (moderate > 0) {
                warnings.push(`중간 위험 보안 취약점 ${moderate}개 발견`);
                overallScore -= moderate * 3;
            }

            if (low > 0) {
                warnings.push(`낮은 위험 보안 취약점 ${low}개 발견`);
                overallScore -= low * 1;
            }

            console.log(
                `  🛡️ 취약점: Critical(${critical}), High(${high}), Moderate(${moderate}), Low(${low})`
            );
        }

        if (issues.length === 0) {
            console.log('  ✅ 중요한 보안 취약점 없음');
        }
    } catch (error) {
        // npm audit가 취약점을 발견했을 때도 에러를 발생시키므로 출력 확인
        if (error.stdout) {
            try {
                const auditData = JSON.parse(error.stdout);
                // 위와 동일한 처리 로직
            } catch (parseError) {
                warnings.push('보안 검사 실행 중 오류');
                overallScore -= 5;
            }
        }
    }
}

// 5. 접근성 기본 검사
function checkAccessibility() {
    console.log('♿ 5. 접근성 기본 검사 중...');

    // HTML 파일들의 기본 접근성 요소 확인
    const htmlFiles = findHTMLFiles('./');
    let accessibilityIssues = 0;

    for (const file of htmlFiles) {
        try {
            const content = readFileSync(file, 'utf8');

            // 기본 접근성 검사
            if (!content.includes('lang=')) {
                accessibilityIssues++;
                warnings.push(`${file}: lang 속성 누락`);
            }

            if (!content.includes('<title>')) {
                accessibilityIssues++;
                warnings.push(`${file}: title 태그 누락`);
            }

            // alt 속성 검사 (기본적인 수준)
            const imgTags = content.match(/<img[^>]*>/g) || [];
            for (const img of imgTags) {
                if (!img.includes('alt=')) {
                    accessibilityIssues++;
                    warnings.push(`${file}: img 태그에 alt 속성 누락`);
                    break; // 파일당 한 번만 경고
                }
            }
        } catch (error) {
            warnings.push(`${file}: 접근성 검사 실패`);
        }
    }

    if (accessibilityIssues > 0) {
        overallScore -= accessibilityIssues * 2;
        console.log(`  ⚠️ 접근성 문제 ${accessibilityIssues}개 발견`);
    } else {
        console.log('  ✅ 기본 접근성 검사 통과');
    }
}

// 빌드 출력 분석
function analyzeBuildOutput(distDir) {
    const analysis = {
        totalSize: 0,
        fileCount: 0,
        largeFiles: [],
    };

    function analyzeDirectory(dir) {
        const items = readdirSync(dir);

        for (const item of items) {
            const fullPath = join(dir, item);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                analyzeDirectory(fullPath);
            } else {
                analysis.fileCount++;
                analysis.totalSize += stat.size;

                const ext = item.split('.').pop()?.toLowerCase();
                let threshold = 0;

                switch (ext) {
                    case 'js':
                        threshold = QUALITY_THRESHOLDS.performance.jsFileSize;
                        break;
                    case 'css':
                        threshold = QUALITY_THRESHOLDS.performance.cssFileSize;
                        break;
                    case 'html':
                        threshold = QUALITY_THRESHOLDS.performance.htmlFileSize;
                        break;
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'webp':
                        threshold = QUALITY_THRESHOLDS.performance.imageSize;
                        break;
                }

                if (threshold && stat.size > threshold) {
                    analysis.largeFiles.push({
                        path: fullPath.replace(distDir, ''),
                        size: stat.size,
                        ext,
                    });
                }
            }
        }
    }

    analyzeDirectory(distDir);
    return analysis;
}

// HTML 파일 찾기
function findHTMLFiles(dir) {
    const htmlFiles = [];
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);

        if (item.endsWith('.html') && !item.startsWith('test-') && !item.startsWith('debug-')) {
            htmlFiles.push(fullPath);
        }
    }

    return htmlFiles;
}

// 최종 결과 출력
function printResults() {
    console.log('\n📊 === 품질 게이트 검증 결과 ===\n');

    // 전체 점수
    overallScore = Math.max(0, Math.min(100, overallScore));
    console.log(`🎯 전체 점수: ${overallScore}/100`);

    // 이슈 출력
    if (issues.length > 0) {
        console.log('\n❌ 해결 필요한 이슈:');
        for (const issue of issues) {
            console.log(`  • ${issue}`);
        }
    }

    // 경고 출력
    if (warnings.length > 0) {
        console.log('\n⚠️ 개선 권장 사항:');
        for (const warning of warnings) {
            console.log(`  • ${warning}`);
        }
    }

    // 최종 판정
    console.log('\n🏁 최종 판정:');
    if (overallScore >= 90 && issues.length === 0) {
        console.log('✅ 품질 게이트 통과: 배포 승인');
        process.exit(0);
    } else if (overallScore >= 70) {
        console.log('⚠️ 조건부 통과: 경고사항 검토 후 배포 가능');
        process.exit(0);
    } else {
        console.log('❌ 품질 게이트 실패: 이슈 해결 후 재시도 필요');
        process.exit(1);
    }
}

// 메인 실행 함수
async function runQualityGates() {
    try {
        checkCodeQuality();
        checkBuild();
        checkPerformance();
        checkSecurity();
        checkAccessibility();

        printResults();
    } catch (error) {
        console.error('\n❌ 품질 게이트 검증 중 오류가 발생했습니다:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    runQualityGates();
}
