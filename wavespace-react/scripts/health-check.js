#!/usr/bin/env node

// 헬스체크 스크립트
const http = require('http');
const https = require('https');
const { URL } = require('url');

class HealthChecker {
  constructor() {
    this.checks = [
      {
        name: 'Application Status',
        type: 'http',
        url: process.env.HEALTH_CHECK_URL || 'http://localhost:3000',
        timeout: 5000,
        expected: {
          status: [200, 201, 202],
          headers: {},
          body: null
        }
      },
      {
        name: 'Supabase Connection',
        type: 'http',
        url: process.env.VITE_SUPABASE_URL || 'https://test.supabase.co',
        timeout: 10000,
        expected: {
          status: [200, 404], // 404도 연결은 가능함을 의미
          headers: {},
          body: null
        }
      },
      {
        name: 'Static Assets',
        type: 'file',
        paths: [
          'dist/index.html',
          'public/manifest.json',
          'public/sw.js'
        ]
      }
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  async httpCheck(check) {
    return new Promise((resolve) => {
      try {
        const url = new URL(check.url);
        const client = url.protocol === 'https:' ? https : http;
        
        const startTime = Date.now();
        
        const request = client.request(url, {
          method: 'GET',
          timeout: check.timeout,
          headers: {
            'User-Agent': 'WAVE-space-health-check/1.0'
          }
        }, (response) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });
          
          response.on('end', () => {
            const isStatusOk = check.expected.status.includes(response.statusCode);
            
            const result = {
              name: check.name,
              success: isStatusOk,
              status: response.statusCode,
              responseTime,
              headers: response.headers,
              body: body.substring(0, 200), // 처음 200자만
              error: isStatusOk ? null : `Unexpected status code: ${response.statusCode}`
            };
            
            resolve(result);
          });
        });
        
        request.on('error', (error) => {
          resolve({
            name: check.name,
            success: false,
            status: 0,
            responseTime: Date.now() - startTime,
            error: error.message
          });
        });
        
        request.on('timeout', () => {
          request.destroy();
          resolve({
            name: check.name,
            success: false,
            status: 0,
            responseTime: check.timeout,
            error: `Timeout after ${check.timeout}ms`
          });
        });
        
        request.end();
        
      } catch (error) {
        resolve({
          name: check.name,
          success: false,
          status: 0,
          responseTime: 0,
          error: error.message
        });
      }
    });
  }

  async fileCheck(check) {
    const fs = require('fs').promises;
    const results = [];
    
    for (const filePath of check.paths) {
      try {
        const stats = await fs.stat(filePath);
        results.push({
          path: filePath,
          exists: true,
          size: stats.size,
          modified: stats.mtime
        });
      } catch (error) {
        results.push({
          path: filePath,
          exists: false,
          error: error.message
        });
      }
    }
    
    const allExist = results.every(r => r.exists);
    
    return {
      name: check.name,
      success: allExist,
      results,
      error: allExist ? null : 'Some files are missing'
    };
  }

  async runCheck(check) {
    this.log(`Running check: ${check.name}`, 'info');
    
    switch (check.type) {
      case 'http':
        return await this.httpCheck(check);
      case 'file':
        return await this.fileCheck(check);
      default:
        return {
          name: check.name,
          success: false,
          error: `Unknown check type: ${check.type}`
        };
    }
  }

  async runAll() {
    this.log('🏥 Starting health checks...', 'info');
    console.log('=' .repeat(50));
    
    const results = [];
    let allPassed = true;
    
    for (const check of this.checks) {
      const result = await this.runCheck(check);
      results.push(result);
      
      if (result.success) {
        this.log(`${result.name}: PASS`, 'success');
        if (result.responseTime) {
          this.log(`  Response time: ${result.responseTime}ms`, 'info');
        }
      } else {
        this.log(`${result.name}: FAIL - ${result.error}`, 'error');
        allPassed = false;
      }
    }
    
    // 요약
    console.log('\n' + '=' .repeat(50));
    this.log('Health Check Summary:', 'info');
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    console.log(`📊 Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (allPassed) {
      this.log('🎉 All health checks passed!', 'success');
    } else {
      this.log('⚠️ Some health checks failed!', 'warning');
    }
    
    // JSON 출력 (CI/CD용)
    if (process.env.OUTPUT_JSON) {
      const jsonOutput = {
        timestamp: new Date().toISOString(),
        success: allPassed,
        results,
        summary: {
          total,
          passed,
          failed: total - passed,
          successRate: Math.round((passed / total) * 100)
        }
      };
      
      console.log('\n--- JSON OUTPUT ---');
      console.log(JSON.stringify(jsonOutput, null, 2));
    }
    
    // 종료 코드
    process.exit(allPassed ? 0 : 1);
  }
}

// 신호 처리
process.on('SIGINT', () => {
  console.log('\n🛑 Health check interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Health check terminated');
  process.exit(1);
});

// 메인 실행
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAll().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = HealthChecker;