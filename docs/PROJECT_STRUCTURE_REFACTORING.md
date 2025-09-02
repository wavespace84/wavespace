# WAVE SPACE 프로젝트 구조 개선 계획

## 현재 구조의 문제점

1. **루트 디렉토리 혼잡**
   - 27개의 JavaScript 파일이 루트에 산재
   - 페이지별 JS 파일과 설정 파일이 혼재
   - 백업 파일들이 프로덕션 파일과 섞여있음

2. **일관성 부족**
   - 일부는 /js 디렉토리 사용, 일부는 루트 사용
   - 네이밍 규칙 불일치 (underscore vs hyphen)
   - 백업/임시 파일들이 정리되지 않음

3. **유지보수 어려움**
   - 파일 찾기 어려움
   - 의존성 관리 복잡
   - 버전 관리 혼란

## 개선된 구조 제안

```
wavespace/
├── index.html
├── *.html (페이지 파일들)
├── common.css
├── *.css (페이지별 CSS)
├── config/
│   ├── config.dev.js
│   ├── config.prod.template.js
│   └── vite.config.js
├── js/
│   ├── main.js (진입점)
│   ├── pages/
│   │   ├── events.js
│   │   ├── notice.js
│   │   ├── updates.js
│   │   ├── support.js
│   │   ├── admin.js
│   │   ├── ai-matching.js
│   │   ├── data-center.js
│   │   ├── planning-recruitment.js
│   │   ├── sales-recruit.js
│   │   ├── points-shop.js
│   │   ├── points-policy.js
│   │   ├── points-charge.js
│   │   ├── plus-membership.js
│   │   ├── qna.js
│   │   └── market-research.js
│   ├── core/
│   │   ├── WaveSpaceData.js
│   │   └── preload.js
│   ├── modules/
│   │   ├── sidebar.js
│   │   ├── header.js
│   │   ├── auth-guard.js
│   │   └── utils.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── fileService.js
│   │   ├── noticeService.js
│   │   ├── postService.js
│   │   ├── pointService.js
│   │   ├── notificationService.js
│   │   ├── adminService.js
│   │   └── feedbackService.js
│   ├── utils/
│   │   ├── xssProtection.js
│   │   ├── errorHandler.js
│   │   ├── domSafety.js
│   │   └── validators.js
│   └── config/
│       ├── env.js
│       ├── supabase.js
│       └── firebase.js
├── backup/
│   ├── notice_original.js
│   ├── notice_mock_backup.js
│   ├── data-center-backup.js
│   └── sidebar-debug.js
├── docs/
│   ├── PRD/
│   ├── DESIGN_SYSTEM.md
│   ├── WORKFLOW.md
│   └── SECURITY_GUIDE.md
└── assets/
    ├── images/
    ├── fonts/
    └── icons/
```

## 이동 계획

### Phase 1: 백업 파일 정리
1. `backup/` 디렉토리 생성
2. 백업/디버그 파일 이동:
   - notice_original.js → backup/
   - notice_mock_backup.js → backup/
   - data-center-backup.js → backup/
   - sidebar-debug.js → backup/
   - sidebar-diagnosis.js → backup/

### Phase 2: 설정 파일 정리
1. `config/` 디렉토리 생성
2. 설정 파일 이동:
   - config.dev.js → config/
   - config.prod.template.js → config/
   - vite.config.js → config/
   - lighthouse.config.js → config/

### Phase 3: 페이지별 JS 파일 정리
1. 모든 페이지 JS 파일을 `js/pages/`로 이동
2. script.js는 legacy 코드이므로 backup/으로 이동
3. preload.js는 js/core/로 이동

### Phase 4: HTML 파일 업데이트
1. 모든 HTML 파일의 script 경로 업데이트
2. 상대 경로를 새 구조에 맞게 수정

## 주의사항

1. **점진적 이동**: 한 번에 모든 파일을 이동하지 않고 단계별로 진행
2. **경로 업데이트**: 파일 이동 후 반드시 관련 HTML의 경로 업데이트
3. **테스트**: 각 단계 후 기능 테스트 수행
4. **버전 관리**: 각 단계를 별도 커밋으로 관리

## 예상 효과

1. **개발 효율성 향상**
   - 파일 찾기 쉬워짐
   - 구조가 명확해짐
   - 새 개발자 온보딩 용이

2. **유지보수성 개선**
   - 백업 파일과 프로덕션 파일 분리
   - 기능별 그룹화로 관련 파일 찾기 쉬움
   - 의존성 관리 명확

3. **확장성 증대**
   - 새 기능 추가 시 적절한 위치 명확
   - 모듈화로 재사용성 향상