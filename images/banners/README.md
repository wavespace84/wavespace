# 배너 이미지 가이드

## 이미지 저장 위치
이 폴더 (`/images/banners/`)에 배너 이미지를 저장하세요.

## 권장 사양
- **크기**: 1200px × 180px
- **형식**: JPG, PNG, WebP
- **파일명 예시**: 
  - `banner1.jpg`
  - `banner2.jpg`
  - `banner3.jpg`
  - 또는 의미있는 이름: `promotion-january.jpg`, `event-newyear.png`

## HTML에서 사용하기
```html
<!-- 예시: banner1.jpg 사용 -->
<img src="images/banners/banner1.jpg" alt="배너 1">

<!-- 예시: 프로모션 배너 -->
<img src="images/banners/promotion-january.jpg" alt="1월 프로모션">
```

## 이미지 교체 방법
1. 원하는 이미지를 이 폴더에 저장
2. `data-center.html` 파일을 열기
3. placeholder URL을 실제 이미지 경로로 변경:
   - 변경 전: `https://via.placeholder.com/1200x180/...`
   - 변경 후: `images/banners/banner1.jpg`

## 샘플 이미지 만들기
- Photoshop, Figma, Canva 등에서 1200×180 크기로 제작
- 또는 무료 이미지 사이트에서 다운로드:
  - Unsplash.com
  - Pexels.com
  - Pixabay.com