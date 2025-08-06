# 사람인(Saramin) CSS 분석 보고서

## 요약
- 분석된 페이지 수: 5
- 총 CSS 파일 수: 16
- 발견된 색상 수: 31
- 버튼 스타일 수: 65
- 카드 스타일 수: 40
- 폼 스타일 수: 10

## CSS 파일 구조
### 레이아웃 관련 (3개)
- header_default.css?v=20250722142036
- gnb_default_override.css?v=20250722142036
- layout.css?v=20250722142036

### 컴포넌트 관련 (2개)
- pattern.css?v=20250722142036
- components.css?v=20250722142036

### 페이지별 스타일 (4개)
- main.css?v=20250722142036
- login.css?v=20250722142036
- jobs-recruit.css?v=20250722142036
- jobs-total.css?v=20250722142036

## 디자인 시스템 분석

### 주요 폰트
- **Primary Font**: Pretendard, "Malgun Gothic", dotum, gulim, sans-serif
- **Fallback Font**: "Malgun Gothic", arial, sans-serif

### 색상 팔레트
#### 주요 블루 계열 (Primary Colors)
1. rgb(45, 103, 255)
2. rgb(132, 145, 167)
3. rgb(55, 63, 87)
4. rgb(215, 220, 229)
5. rgb(92, 102, 123)

#### 색상 그룹
- **블루 계열**: 20개
- **그레이 계열**: 3개
- **기타**: 0개

### 타이포그래피
#### 폰트 크기
13px, 14px, 15px, 16px, 17px, 1px, 36px

#### 폰트 굵기
400, 700

#### 태그별 스타일
- **a**: 14개 변형, 주요 크기: 14px, 주요 굵기: 400
- **h1**: 2개 변형, 주요 크기: 16px, 주요 굵기: 400
- **span**: 20개 변형, 주요 크기: 14px, 주요 굵기: 400
- **h5**: 2개 변형, 주요 크기: 16px, 주요 굵기: 400

### 버튼 스타일 분석
- **총 버튼 스타일**: 65개
- **투명 배경**: 55개
- **보더 있음**: 65개
- **둥근 모서리**: 16개

#### Border Radius 사용
0px, 28px, 16px, 0px 4px 4px 0px, 4px, 20px

### 레이아웃 시스템
{
  "body": {
    "display": "block",
    "maxWidth": "none",
    "margin": "0px",
    "padding": "48px 0px 0px",
    "width": "1920px"
  },
  "main": null,
  "container": {
    "display": "block",
    "maxWidth": "none",
    "margin": "0px",
    "padding": "20px 0px",
    "width": "216px"
  }
}

### 네비게이션 스타일
{
  "backgroundColor": "rgb(255, 255, 255)",
  "color": "rgb(0, 0, 0)",
  "height": "161px",
  "display": "block",
  "position": "sticky",
  "zIndex": "100",
  "boxShadow": "none"
}

### 공통 Border Radius
0px 4px 4px 0px, 16px, 20px, 28px, 4px, 8px

### 공통 Spacing (Padding)
0px 0px 0px 10px, 0px 0px 0px 14px, 0px 13px, 0px 24px 0px 48px, 0px 4px, 10px 0px, 10px 0px 12px 83px, 12px 0px, 13px 15px 15px, 24px 12px 8px, 2px 0px, 4px 8px, 7px 5px 5px, 8px 20px 8px 48px, 8px 4px, 9px 0px

## 주요 발견사항
1. 사람인은 Pretendard 폰트를 주요 폰트로 사용하며, Malgun Gothic을 폴백으로 사용
2. 주요 색상은 파란색 계열 (rgb(45, 103, 255), rgb(72, 118, 239) 등)
3. 버튼은 대부분 투명 배경에 보더를 사용하는 스타일
4. Grid 디스플레이를 적극적으로 활용
5. 다양한 border-radius 값 사용 (0px, 16px, 28px 등)
