import { useState, useEffect, useCallback } from 'react';
import { pointService } from '../services/pointService';
import type { PointTransaction } from '../lib/supabase/types';
import { useAuth } from './useAuth';

interface UsePointsReturn {
  // State
  balance: number;
  transactions: PointTransaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  earnPoints: (amount: number, reason: string, referenceId?: string) => Promise<{ success: boolean; error?: string }>;
  spendPoints: (amount: number, reason: string, referenceId?: string) => Promise<{ success: boolean; error?: string }>;
  dailyAttendance: () => Promise<{ success: boolean; error?: string }>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

interface UsePointsOptions {
  autoFetch?: boolean;
  pageSize?: number;
  filters?: {
    type?: 'earn' | 'spend' | 'admin';
    startDate?: string;
    endDate?: string;
  };
}

export const usePoints = (options: UsePointsOptions = {}): UsePointsReturn => {
  const { autoFetch = true, pageSize = 20, filters = {} } = options;
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 포인트 잔액 조회
  const fetchBalance = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await pointService.getBalance(user.id);
      
      if (response.success) {
        setBalance(response.balance || 0);
      }
    } catch (err) {
      console.error('포인트 잔액 조회 오류:', err);
    }
  }, [user?.id]);

  // 포인트 내역 조회
  const fetchTransactions = useCallback(async (page = 1) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await pointService.getTransactionHistory(
        { userId: user.id, ...filters },
        page,
        pageSize
      );

      if (response.success && response.data) {
        if (page === 1) {
          setTransactions(response.data);
        } else {
          setTransactions(prev => [...prev, ...response.data!]);
        }
        
        setHasMore(response.data.length === pageSize);
        setCurrentPage(page);
      } else {
        setError(response.error || '포인트 내역을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('포인트 내역 조회 중 오류가 발생했습니다.');
      console.error('포인트 내역 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filters, pageSize]);

  // 포인트 적립
  const earnPoints = useCallback(async (amount: number, reason: string, referenceId?: string) => {
    if (!user?.id) return { success: false, error: '로그인이 필요합니다.' };

    try {
      const response = await pointService.earnPoints(user.id, amount, reason, referenceId);
      
      if (response.success && response.transaction) {
        // 잔액 업데이트
        setBalance(prev => prev + amount);
        
        // 내역에 새 트랜잭션 추가
        setTransactions(prev => [response.transaction!, ...prev]);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('포인트 적립 오류:', err);
      return { success: false, error: '포인트 적립 중 오류가 발생했습니다.' };
    }
  }, [user?.id]);

  // 포인트 사용
  const spendPoints = useCallback(async (amount: number, reason: string, referenceId?: string) => {
    if (!user?.id) return { success: false, error: '로그인이 필요합니다.' };

    // 잔액 확인
    if (balance < amount) {
      return { success: false, error: '포인트 잔액이 부족합니다.' };
    }

    try {
      const response = await pointService.spendPoints(user.id, amount, reason, referenceId);
      
      if (response.success && response.transaction) {
        // 잔액 업데이트
        setBalance(prev => prev - amount);
        
        // 내역에 새 트랜잭션 추가
        setTransactions(prev => [response.transaction!, ...prev]);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('포인트 사용 오류:', err);
      return { success: false, error: '포인트 사용 중 오류가 발생했습니다.' };
    }
  }, [user?.id, balance]);

  // 출석체크 포인트
  const dailyAttendance = useCallback(async () => {
    if (!user?.id) return { success: false, error: '로그인이 필요합니다.' };

    try {
      const response = await pointService.dailyAttendance(user.id);
      
      if (response.success && response.transaction) {
        // 잔액 업데이트
        setBalance(prev => prev + 20); // 출석체크 기본 포인트
        
        // 내역에 새 트랜잭션 추가
        setTransactions(prev => [response.transaction!, ...prev]);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('출석체크 오류:', err);
      return { success: false, error: '출석체크 중 오류가 발생했습니다.' };
    }
  }, [user?.id]);

  // 새로고침
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await Promise.all([
      fetchBalance(),
      fetchTransactions(1)
    ]);
  }, [fetchBalance, fetchTransactions]);

  // 더 많은 내역 로드
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchTransactions(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, fetchTransactions]);

  // 초기 데이터 로드
  useEffect(() => {
    if (autoFetch && user?.id) {
      refresh();
    }
  }, [user?.id, autoFetch, refresh]);

  return {
    // State
    balance,
    transactions,
    isLoading,
    error,
    
    // Actions
    earnPoints,
    spendPoints,
    dailyAttendance,
    fetchBalance,
    fetchTransactions,
    refresh,
    
    // Pagination
    hasMore,
    loadMore
  };
};

// 포인트 랭킹용 훅
interface UsePointsRankingReturn {
  ranking: Array<{
    id: string;
    username: string;
    full_name: string;
    user_type: string;
    points: number;
    rank: number;
  }>;
  myRank: number;
  myPoints: number;
  isLoading: boolean;
  error: string | null;
  fetchRanking: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const usePointsRanking = (limit = 50): UsePointsRankingReturn => {
  const { user } = useAuth();
  
  const [ranking, setRanking] = useState<Array<any>>([]);
  const [myRank, setMyRank] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 랭킹 조회
  const fetchRanking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pointService.getPointsRanking(limit);
      
      if (response.success && response.data) {
        setRanking(response.data);
      } else {
        setError(response.error || '랭킹을 불러올 수 없습니다.');
      }

      // 내 랭킹 조회
      if (user?.id) {
        const myRankResponse = await pointService.getMyRanking(user.id);
        if (myRankResponse.success) {
          setMyRank(myRankResponse.rank || 0);
          setMyPoints(myRankResponse.points || 0);
        }
      }
    } catch (err) {
      setError('랭킹 조회 중 오류가 발생했습니다.');
      console.error('포인트 랭킹 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, user?.id]);

  // 새로고침
  const refresh = useCallback(async () => {
    await fetchRanking();
  }, [fetchRanking]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return {
    ranking,
    myRank,
    myPoints,
    isLoading,
    error,
    fetchRanking,
    refresh
  };
};