import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Platform } from '../../utils/platform';

export interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  quality?: number;
  blur?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
}

type ImageState = 'loading' | 'loaded' | 'error';

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  fallback = '/images/placeholder.svg',
  className = '',
  width,
  height,
  objectFit = 'cover',
  quality = 85,
  blur = true,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  priority = false,
  sizes,
  srcSet
}) => {
  const [imageState, setImageState] = useState<ImageState>('loading');
  const [imageSrc, setImageSrc] = useState<string>(placeholder || fallback);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // 이미지 최적화 URL 생성
  const optimizedSrc = useMemo(() => {
    if (!src || priority) return src;
    
    // 이미지 변환 서비스 URL (예: Cloudinary, ImageKit 등)
    if (src.includes('supabase.co/storage/') && quality < 100) {
      const url = new URL(src);
      url.searchParams.set('quality', quality.toString());
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      return url.toString();
    }
    
    return src;
  }, [src, quality, width, height, priority]);

  // WebP 지원 감지
  const supportsWebP = useMemo(() => {
    if (!Platform.isWeb) return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  // WebP 버전 URL 생성
  const webpSrc = useMemo(() => {
    if (!supportsWebP || !optimizedSrc) return optimizedSrc;
    
    if (optimizedSrc.includes('supabase.co/storage/')) {
      const url = new URL(optimizedSrc);
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    return optimizedSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }, [optimizedSrc, supportsWebP]);

  // 교차 관찰자 설정
  useEffect(() => {
    if (priority || !Platform.isWeb) {
      setIsVisible(true);
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observerRef.current?.disconnect();
            }
          });
        },
        {
          threshold,
          rootMargin
        }
      );

      observerRef.current.observe(img);
    } else {
      // 폴백: IntersectionObserver 미지원 시 즉시 로드
      setIsVisible(true);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, priority]);

  // 이미지 로딩 핸들러
  const handleImageLoad = useCallback(() => {
    setImageState('loaded');
    onLoad?.();
    
    // 성능 메트릭 기록
    if (Platform.isWeb && process.env.NODE_ENV === 'development') {
      const img = imgRef.current;
      if (img) {
        const loadTime = Date.now() - parseInt(img.dataset.loadStart || '0');
        if (loadTime > 2000) {
          console.warn(`LazyImage: Slow image loading detected - ${alt} took ${loadTime}ms`);
        }
      }
    }
  }, [onLoad, alt]);

  const handleImageError = useCallback(() => {
    setImageState('error');
    setImageSrc(fallback);
    onError?.('이미지를 불러올 수 없습니다');
  }, [fallback, onError]);

  // 이미지 미리 로드
  useEffect(() => {
    if (!isVisible || !optimizedSrc) return;

    const img = new Image();
    
    // 로딩 시작 시간 기록
    if (imgRef.current) {
      imgRef.current.dataset.loadStart = Date.now().toString();
    }

    // srcSet 지원
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;

    img.onload = () => {
      setImageSrc(webpSrc || optimizedSrc);
      handleImageLoad();
    };
    
    img.onerror = handleImageError;
    
    // WebP 우선 시도
    img.src = webpSrc || optimizedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, optimizedSrc, webpSrc, srcSet, sizes, handleImageLoad, handleImageError]);

  // 스타일 계산
  const imageStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
    objectFit,
    transition: 'all 0.3s ease-in-out',
    filter: imageState === 'loading' && blur ? 'blur(10px)' : 'none',
    opacity: imageState === 'loaded' ? 1 : 0.7,
    transform: imageState === 'loaded' ? 'scale(1)' : 'scale(1.05)'
  };

  // 플레이스홀더 스타일
  const placeholderStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 200,
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageState === 'loading' && !isVisible && (
        <div style={placeholderStyle} className="animate-pulse">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-lg mb-2 mx-auto"></div>
            <p className="text-sm">로딩 중...</p>
          </div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} ${imageState === 'loaded' ? '' : 'opacity-0'}`}
        style={imageStyle}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        srcSet={srcSet}
        sizes={sizes}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {imageState === 'loading' && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wave-600"></div>
        </div>
      )}

      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 이미지 갤러리 컴포넌트
export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  className?: string;
  columns?: number;
  gap?: number;
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  columns = 3,
  gap = 4,
  onImageClick
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap * 0.25}rem`
  };

  return (
    <div className={`${className}`} style={gridStyle}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square cursor-pointer group"
          onClick={() => onImageClick?.(index)}
        >
          <LazyImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            className="w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-200"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// 이미지 최적화 훅
export function useImageOptimization(src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
} = {}) {
  const { width, height, quality = 85, format } = options;

  const optimizedUrl = useMemo(() => {
    if (!src) return src;

    try {
      const url = new URL(src);
      
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      if (quality < 100) url.searchParams.set('quality', quality.toString());
      if (format) url.searchParams.set('format', format);

      return url.toString();
    } catch {
      return src;
    }
  }, [src, width, height, quality, format]);

  return optimizedUrl;
}

// 이미지 미리 로드 훅
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (url: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    };

    const preloadImages = async () => {
      const promises = urls.map(url => 
        preloadImage(url)
          .then(url => {
            setLoadedImages(prev => new Set(prev).add(url));
            return url;
          })
          .catch(url => {
            setFailedImages(prev => new Set(prev).add(url));
            throw url;
          })
      );

      try {
        await Promise.allSettled(promises);
      } catch {
        // 일부 이미지 로딩 실패 허용
      }
    };

    if (urls.length > 0) {
      preloadImages();
    }
  }, [urls]);

  return {
    loadedImages,
    failedImages,
    isLoaded: (url: string) => loadedImages.has(url),
    isFailed: (url: string) => failedImages.has(url)
  };
}

export default LazyImage;