#!/usr/bin/env node

/**
 * WAVE SPACE 개발 환경 설정 스크립트
 * 초기 개발 환경을 자동으로 구성합니다.
 */

import { existsSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = process.cwd();

console.log('🚀 WAVE SPACE 개발 환경 설정을 시작합니다...\n');

// 1. 환경 변수 파일 생성
function setupEnvironment() {
    console.log('📝 환경 변수 설정 중...');

    const envExample = path.join(PROJECT_ROOT, '.env.example');
    const envLocal = path.join(PROJECT_ROOT, '.env');

    if (!existsSync(envLocal) && existsSync(envExample)) {
        copyFileSync(envExample, envLocal);
        console.log('✅ .env 파일이 생성되었습니다');
    } else {
        console.log('ℹ️  .env 파일이 이미 존재합니다');
    }
}

// 2. 의존성 설치
function installDependencies() {
    console.log('📦 의존성 설치 중...');

    try {
        execSync('npm install', { stdio: 'inherit', cwd: PROJECT_ROOT });
        console.log('✅ 의존성 설치 완료');
    } catch (error) {
        console.error('❌ 의존성 설치 실패:', error.message);
        process.exit(1);
    }
}

// 3. 품질 검사 도구 실행
function runQualityCheck() {
    console.log('🔍 코드 품질 검사 중...');

    try {
        execSync('npm run quality', { stdio: 'inherit', cwd: PROJECT_ROOT });
        console.log('✅ 코드 품질 검사 통과');
    } catch (error) {
        console.warn('⚠️  일부 품질 검사에서 경고가 발생했습니다');
        console.warn('   개발을 시작하기 전에 수정하는 것을 권장합니다');
    }
}

// 4. 개발 서버 시작 안내
function showStartupInstructions() {
    console.log('\n🎉 개발 환경 설정이 완료되었습니다!\n');
    console.log('다음 명령어로 개발 서버를 시작할 수 있습니다:');
    console.log('  npm run dev    - 개발 서버 시작 (포트 3000)');
    console.log('  npm run build  - 프로덕션 빌드');
    console.log('  npm run preview - 빌드 결과 미리보기\n');

    console.log('추가 유용한 명령어:');
    console.log('  npm run lint      - ESLint 검사');
    console.log('  npm run format    - Prettier 포맷팅');
    console.log('  npm run quality   - 전체 품질 검사\n');

    console.log('🔗 유용한 링크:');
    console.log('  개발 서버: http://localhost:3000');
    console.log('  문서: ./docs/');
    console.log('  디자인 시스템: ./docs/design-system-final (디자인 시스템).md\n');
}

// 메인 실행 함수
async function main() {
    try {
        setupEnvironment();
        installDependencies();
        runQualityCheck();
        showStartupInstructions();
    } catch (error) {
        console.error('❌ 설정 중 오류가 발생했습니다:', error.message);
        process.exit(1);
    }
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
