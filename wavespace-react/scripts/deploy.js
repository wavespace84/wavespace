#!/usr/bin/env node

// 배포 자동화 스크립트
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const readline = require('readline');

class DeployManager {
  constructor() {
    this.environments = {
      development: {
        name: 'Development',
        branch: 'develop',
        url: 'https://dev-wavespace.vercel.app',
        supabaseProject: 'dev-project'
      },
      staging: {
        name: 'Staging',
        branch: 'staging', 
        url: 'https://staging-wavespace.vercel.app',
        supabaseProject: 'staging-project'
      },
      production: {
        name: 'Production',
        branch: 'main',
        url: 'https://wavespace.kr',
        supabaseProject: 'prod-project'
      }
    };

    this.steps = [];
    this.currentStep = 0;
  }

  // 로그 출력
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '💫',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      step: '🔄'
    };

    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  // 명령어 실행
  async exec(command, options = {}) {
    return new Promise((resolve, reject) => {
      this.log(`Executing: ${command}`, 'step');
      
      exec(command, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10, // 10MB
        ...options
      }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Command failed: ${error.message}`, 'error');
          reject(error);
          return;
        }

        if (stderr && !options.ignoreStderr) {
          this.log(`Warning: ${stderr}`, 'warning');
        }

        if (stdout) {
          console.log(stdout);
        }

        resolve({ stdout, stderr });
      });
    });
  }

  // 동기 명령어 실행
  execSync(command, options = {}) {
    this.log(`Executing: ${command}`, 'step');
    
    try {
      const result = execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'inherit',
        ...options
      });
      
      return result;
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // 사용자 입력 받기
  async prompt(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  // 환경 선택
  async selectEnvironment() {
    console.log('\n📋 배포 환경을 선택하세요:');
    
    const envKeys = Object.keys(this.environments);
    envKeys.forEach((key, index) => {
      const env = this.environments[key];
      console.log(`  ${index + 1}. ${env.name} (${key}) - ${env.url}`);
    });

    const answer = await this.prompt('\n선택 (1-3): ');
    const selectedIndex = parseInt(answer) - 1;

    if (selectedIndex < 0 || selectedIndex >= envKeys.length) {
      this.log('잘못된 선택입니다.', 'error');
      process.exit(1);
    }

    const selectedKey = envKeys[selectedIndex];
    const selectedEnv = this.environments[selectedKey];

    this.log(`선택된 환경: ${selectedEnv.name}`, 'success');
    return { key: selectedKey, ...selectedEnv };
  }

  // Git 상태 확인
  async checkGitStatus() {
    this.log('Git 상태 확인 중...', 'step');

    try {
      // 현재 브랜치 확인
      const currentBranch = this.execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).trim();
      this.log(`현재 브랜치: ${currentBranch}`);

      // 변경사항 확인
      const status = this.execSync('git status --porcelain', { stdio: 'pipe' });
      if (status.trim()) {
        this.log('⚠️ 커밋되지 않은 변경사항이 있습니다:', 'warning');
        console.log(status);
        
        const answer = await this.prompt('계속하시겠습니까? (y/n): ');
        if (answer.toLowerCase() !== 'y') {
          process.exit(0);
        }
      }

      return currentBranch;
    } catch (error) {
      this.log('Git 상태 확인 실패', 'error');
      throw error;
    }
  }

  // 의존성 설치 및 업데이트
  async installDependencies() {
    this.log('의존성 설치 중...', 'step');
    
    try {
      // package-lock.json 존재 확인
      const hasPackageLock = fs.existsSync('package-lock.json');
      const hasYarnLock = fs.existsSync('yarn.lock');

      if (hasYarnLock) {
        await this.exec('yarn install --frozen-lockfile');
      } else if (hasPackageLock) {
        await this.exec('npm ci');
      } else {
        await this.exec('npm install');
      }

      this.log('의존성 설치 완료', 'success');
    } catch (error) {
      this.log('의존성 설치 실패', 'error');
      throw error;
    }
  }

  // 린트 및 타입 체크
  async runQualityChecks() {
    this.log('코드 품질 검사 중...', 'step');

    try {
      // TypeScript 타입 체크
      if (fs.existsSync('tsconfig.json')) {
        await this.exec('npx tsc --noEmit');
        this.log('TypeScript 타입 체크 통과', 'success');
      }

      // ESLint 검사
      if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json')) {
        await this.exec('npm run lint');
        this.log('ESLint 검사 통과', 'success');
      }

      // Prettier 검사
      if (fs.existsSync('.prettierrc')) {
        await this.exec('npm run format:check');
        this.log('Prettier 검사 통과', 'success');
      }

    } catch (error) {
      this.log('코드 품질 검사 실패', 'error');
      throw error;
    }
  }

  // 테스트 실행
  async runTests() {
    this.log('테스트 실행 중...', 'step');

    try {
      // 패키지에 테스트 스크립트가 있는지 확인
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.test) {
        await this.exec('npm run test -- --run --coverage');
        this.log('모든 테스트 통과', 'success');
      } else {
        this.log('테스트 스크립트가 없습니다', 'warning');
      }
    } catch (error) {
      this.log('테스트 실패', 'error');
      throw error;
    }
  }

  // 빌드
  async build(environment) {
    this.log(`${environment.name} 환경으로 빌드 중...`, 'step');

    try {
      // 환경변수 설정
      const envVars = [
        `VITE_ENV=${environment.key}`,
        `VITE_APP_URL=${environment.url}`,
        `VITE_SUPABASE_PROJECT=${environment.supabaseProject}`
      ];

      const envString = envVars.join(' ');
      await this.exec(`${envString} npm run build`);
      
      // 빌드 결과 확인
      if (!fs.existsSync('dist')) {
        throw new Error('빌드 실패: dist 폴더가 생성되지 않았습니다');
      }

      // 빌드 크기 분석
      const distStats = this.getDirectorySize('dist');
      this.log(`빌드 크기: ${this.formatBytes(distStats.totalSize)}`, 'info');
      this.log(`파일 수: ${distStats.fileCount}개`, 'info');

      this.log('빌드 완료', 'success');
    } catch (error) {
      this.log('빌드 실패', 'error');
      throw error;
    }
  }

  // 디렉토리 크기 계산
  getDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = (currentPath) => {
      const stats = fs.statSync(currentPath);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          calculateSize(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    };

    calculateSize(dirPath);
    return { totalSize, fileCount };
  }

  // 바이트 포맷팅
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Vercel 배포
  async deployToVercel(environment) {
    this.log('Vercel에 배포 중...', 'step');

    try {
      // Vercel CLI 설치 확인
      try {
        this.execSync('vercel --version', { stdio: 'pipe' });
      } catch {
        this.log('Vercel CLI를 설치합니다...', 'step');
        await this.exec('npm install -g vercel');
      }

      // 배포 명령어 구성
      const deployCommand = environment.key === 'production' 
        ? 'vercel --prod' 
        : 'vercel';

      // 환경변수와 함께 배포
      await this.exec(deployCommand);

      this.log(`${environment.name} 배포 완료!`, 'success');
      this.log(`URL: ${environment.url}`, 'info');
    } catch (error) {
      this.log('Vercel 배포 실패', 'error');
      throw error;
    }
  }

  // 배포 후 검증
  async verifyDeployment(environment) {
    this.log('배포 검증 중...', 'step');

    try {
      const response = await fetch(environment.url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.log('배포 검증 성공', 'success');
      
      // 성능 체크
      const loadTime = Date.now();
      await fetch(`${environment.url}/health-check`).catch(() => {}); // Health check는 선택사항
      const responseTime = Date.now() - loadTime;
      
      this.log(`응답 시간: ${responseTime}ms`, 'info');
      
    } catch (error) {
      this.log(`배포 검증 실패: ${error.message}`, 'warning');
    }
  }

  // 슬랙 알림 (선택사항)
  async sendSlackNotification(environment, success = true) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const message = {
      text: success 
        ? `✅ ${environment.name} 배포 성공!`
        : `❌ ${environment.name} 배포 실패!`,
      attachments: [
        {
          color: success ? 'good' : 'danger',
          fields: [
            {
              title: 'Environment',
              value: environment.name,
              short: true
            },
            {
              title: 'URL',
              value: environment.url,
              short: true
            },
            {
              title: 'Branch',
              value: environment.branch,
              short: true
            },
            {
              title: 'Time',
              value: new Date().toISOString(),
              short: true
            }
          ]
        }
      ]
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      this.log('슬랙 알림 전송 실패', 'warning');
    }
  }

  // 메인 배포 함수
  async deploy() {
    try {
      this.log('🚀 WAVE space 배포 시작', 'info');
      console.log('=' .repeat(50));

      // 1. 환경 선택
      const environment = await this.selectEnvironment();

      // 2. Git 상태 확인
      const currentBranch = await this.checkGitStatus();

      // 3. 브랜치 확인
      if (currentBranch !== environment.branch) {
        const answer = await this.prompt(
          `현재 브랜치 (${currentBranch})가 대상 브랜치 (${environment.branch})와 다릅니다. 계속하시겠습니까? (y/n): `
        );
        
        if (answer.toLowerCase() !== 'y') {
          process.exit(0);
        }
      }

      // 4. 의존성 설치
      await this.installDependencies();

      // 5. 품질 검사
      await this.runQualityChecks();

      // 6. 테스트 실행
      await this.runTests();

      // 7. 빌드
      await this.build(environment);

      // 8. 배포
      await this.deployToVercel(environment);

      // 9. 검증
      await this.verifyDeployment(environment);

      // 10. 알림
      await this.sendSlackNotification(environment, true);

      console.log('\n' + '=' .repeat(50));
      this.log('🎉 배포 완료!', 'success');
      this.log(`🌐 URL: ${environment.url}`, 'info');

    } catch (error) {
      this.log(`배포 실패: ${error.message}`, 'error');
      
      // 실패 알림
      const environment = this.environments.development; // 기본값
      await this.sendSlackNotification(environment, false);
      
      process.exit(1);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const deployer = new DeployManager();
  deployer.deploy().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = DeployManager;