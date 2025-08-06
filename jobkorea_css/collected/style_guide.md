# 잡코리아 스타일 가이드 분석

## 1. 색상 팔레트

### 주요 색상
- **Primary Blue**: `rgb(51, 153, 255)` - 메인 브랜드 색상
- **Black**: `rgb(0, 0, 0)` - 기본 텍스트
- **Dark Gray**: `rgb(23, 23, 23)` - 서브 텍스트
- **Gray**: `rgb(106, 106, 106)` - 보조 텍스트
- **White**: `rgb(255, 255, 255)` - 배경 색상

### 색상 용도
- 메인 브랜드 색상은 주로 버튼, 링크, 강조 요소에 사용
- 텍스트는 주로 검정색과 진회색 사용
- 배경은 흰색 기반

## 2. 타이포그래피

### 폰트 패밀리
```css
font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 
             "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", 
             "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", 
             "Segoe UI Symbol", sans-serif;
```

### 폰트 크기 및 굵기
- **헤딩**: 18px, font-weight: 500, line-height: 26px
- **본문**: 16px, font-weight: 400, line-height: normal
- **소제목**: 14px, font-weight: 400, line-height: normal
- **캡션**: 12px, font-weight: 400, line-height: 20px

## 3. 주요 컴포넌트 스타일

### 헤더
- 배경: 흰색 (`rgb(255, 255, 255)`)
- 상단 패딩: 24px
- 높이: 146px
- 배경 이미지 사용

### 검색박스
- 너비: 440px
- 높이: 40px
- 테두리: 2px solid `rgb(0, 60, 255)`
- 모서리: border-radius 8px
- 왼쪽 마진: 20px

### 배너
- 모서리: border-radius 8px
- 절대 위치 사용 (position: absolute)

### 버튼
- 다양한 크기와 스타일 존재
- 주로 파란색 계열 사용

## 4. 레이아웃 구조

### 그리드 시스템
- 최대 너비: 1260px (컨테이너)
- 전체 화면: 1920px (헤더)

### 간격
- 컴포넌트 간 여백은 주로 20px, 24px 사용
- 패딩과 마진을 통한 공간 배치

## 5. CSS 파일 구조

### 주요 CSS 파일
1. **공통 스타일**: `common-sv-*.css`
2. **메인 페이지**: `main-sv-*.css`
3. **GNB**: `gnb-sv-*.css`
4. **푸터**: `footer-sv-*.css`
5. **컴포넌트별 스타일**: 각 기능별로 분리

### 외부 라이브러리
- Swiper (슬라이더): v4.5.1, v9 사용
- CDN을 통한 외부 라이브러리 로드

## 6. 반응형 디자인
- 기본 뷰포트: 1920x1080
- 모바일 대응은 별도 처리 필요

## 7. 접근성
- 시맨틱 HTML 태그 사용 (header, nav, footer)
- 폰트 크기는 px 단위 사용 (em/rem 대신)

## 8. 성능 최적화
- CSS 파일명에 버전 관리 포함 (예: `-sv-202507091741.css`)
- 캐싱을 위한 버전 관리 시스템

## 9. 디자인 시스템 특징
- Pretendard 폰트를 메인으로 사용
- 깔끔하고 모던한 디자인
- 파란색을 포인트 컬러로 사용
- 카드 기반 레이아웃
- 둥근 모서리 (border-radius) 활용