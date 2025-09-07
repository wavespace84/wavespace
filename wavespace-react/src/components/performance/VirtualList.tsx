import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Platform } from '../../utils/platform';

export interface VirtualListItem {
  id: string | number;
  data: any;
  height?: number;
}

export interface VirtualListProps<T extends VirtualListItem> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T extends VirtualListItem>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
  onScroll,
  onEndReached,
  endReachedThreshold = 0.8,
  loadingComponent,
  emptyComponent,
  getItemKey
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 아이템 높이 계산 함수
  const getHeight = useCallback((index: number, item: T): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, item);
    }
    return item.height || itemHeight;
  }, [itemHeight]);

  // 전체 높이 및 아이템 위치 계산
  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let currentPosition = 0;
    
    for (let i = 0; i < items.length; i++) {
      positions[i] = currentPosition;
      currentPosition += getHeight(i, items[i]);
    }
    
    return {
      totalHeight: currentPosition,
      itemPositions: positions
    };
  }, [items, getHeight]);

  // 보이는 범위 계산
  const visibleRange = useMemo(() => {
    if (items.length === 0) return { start: 0, end: 0 };

    // 이진 탐색으로 시작 인덱스 찾기
    let start = 0;
    let end = items.length - 1;
    
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const position = itemPositions[mid];
      const height = getHeight(mid, items[mid]);
      
      if (position <= scrollTop && position + height > scrollTop) {
        start = mid;
        break;
      } else if (position < scrollTop) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    // 끝 인덱스 찾기
    let endIndex = start;
    let currentHeight = itemPositions[start];
    
    while (endIndex < items.length && currentHeight < scrollTop + containerHeight) {
      currentHeight += getHeight(endIndex, items[endIndex]);
      endIndex++;
    }

    // overscan 적용
    const startIndex = Math.max(0, start - overscan);
    const endIndexWithOverscan = Math.min(items.length - 1, endIndex + overscan);

    return { start: startIndex, end: endIndexWithOverscan };
  }, [scrollTop, containerHeight, itemPositions, items, getHeight, overscan]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);

    onScroll?.(scrollTop);

    // 스크롤 끝 감지
    if (onEndReached) {
      const scrollHeight = e.currentTarget.scrollHeight;
      const clientHeight = e.currentTarget.clientHeight;
      const threshold = scrollHeight * endReachedThreshold;
      
      if (scrollTop + clientHeight >= threshold) {
        onEndReached();
      }
    }

    // 스크롤 종료 감지
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onScroll, onEndReached, endReachedThreshold]);

  // 아이템 키 생성
  const getKey = useCallback((item: T, index: number): string | number => {
    if (getItemKey) return getItemKey(item, index);
    return item.id ?? index;
  }, [getItemKey]);

  // 성능 메트릭 모니터링
  useEffect(() => {
    if (Platform.isWeb && process.env.NODE_ENV === 'development') {
      const visibleItemCount = visibleRange.end - visibleRange.start + 1;
      const totalItems = items.length;
      
      if (totalItems > 1000 && visibleItemCount > 50) {
        console.warn(`VirtualList: Rendering ${visibleItemCount} items out of ${totalItems}. Consider reducing overscan.`);
      }
    }
  }, [visibleRange, items.length]);

  // 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 빈 목록 처리
  if (items.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent || (
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-4">📝</div>
            <p>표시할 항목이 없습니다</p>
          </div>
        )}
      </div>
    );
  }

  // 보이는 아이템 렌더링
  const visibleItems = [];
  for (let i = visibleRange.start; i <= visibleRange.end; i++) {
    const item = items[i];
    const top = itemPositions[i];
    const height = getHeight(i, item);

    visibleItems.push(
      <div
        key={getKey(item, i)}
        className="absolute left-0 right-0"
        style={{
          top: `${top}px`,
          height: `${height}px`
        }}
      >
        {renderItem(item, i)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* 스크롤바를 위한 전체 높이 컨테이너 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
        
        {/* 스크롤 중 표시기 */}
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-10">
            스크롤 중...
          </div>
        )}
        
        {/* 로딩 컴포넌트 */}
        {loadingComponent && (
          <div className="absolute bottom-0 left-0 right-0">
            {loadingComponent}
          </div>
        )}
      </div>
    </div>
  );
}

// 성능 최적화된 아이템 메모이제이션
export const VirtualListItem = React.memo(function VirtualListItem({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
});

// 무한 스크롤을 위한 훅
export function useInfiniteScroll<T>(
  initialItems: T[],
  loadMore: () => Promise<T[]>,
  hasNextPage: boolean = true
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEndReached = useCallback(async () => {
    if (loading || !hasNextPage) return;

    try {
      setLoading(true);
      setError(null);
      const newItems = await loadMore();
      setItems(prev => [...prev, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [loading, hasNextPage, loadMore]);

  return {
    items,
    loading,
    error,
    handleEndReached,
    setItems
  };
}

// 아이템 높이 자동 측정을 위한 훅
export function useItemSizeMeasurer<T>() {
  const [itemSizes, setItemSizes] = useState<Map<string | number, number>>(new Map());
  const observerRef = useRef<ResizeObserver>();

  const measureItem = useCallback((key: string | number, element: HTMLElement | null) => {
    if (!element) return;

    if (!observerRef.current && Platform.isWeb && 'ResizeObserver' in window) {
      observerRef.current = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const itemKey = entry.target.getAttribute('data-item-key');
          if (itemKey) {
            setItemSizes(prev => new Map(prev).set(itemKey, entry.target.clientHeight));
          }
        });
      });
    }

    element.setAttribute('data-item-key', String(key));
    observerRef.current?.observe(element);
  }, []);

  const getItemSize = useCallback((key: string | number, defaultSize: number): number => {
    return itemSizes.get(key) || defaultSize;
  }, [itemSizes]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { measureItem, getItemSize };
}

export default VirtualList;