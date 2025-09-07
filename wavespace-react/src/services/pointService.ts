import { supabase } from '../lib/supabase/client';
import type { PointTransaction, PointTransactionInsert } from '../lib/supabase/types';
import { useAppStore } from '../lib/zustand/appStore';
import { useAuthStore } from '../lib/zustand/authStore';

interface PointResponse {
  success: boolean;
  data?: PointTransaction[];
  transaction?: PointTransaction;
  balance?: number;
  error?: string;
}

interface PointHistoryFilters {
  userId?: string;
  type?: 'earn' | 'spend' | 'admin';
  startDate?: string;
  endDate?: string;
}

export class PointService {
  private static instance: PointService;
  
  private constructor() {}
  
  public static getInstance(): PointService {
    if (!PointService.instance) {
      PointService.instance = new PointService();
    }
    return PointService.instance;
  }

  /**
   * 사용자 포인트 잔액 조회
   */
  async getBalance(userId: string): Promise<PointResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('포인트 잔액 조회 실패:', error);
        return { success: false, error: '포인트 잔액을 조회할 수 없습니다.' };
      }

      return {
        success: true,
        balance: data.points || 0
      };
    } catch (error) {
      console.error('포인트 잔액 서비스 오류:', error);
      return { success: false, error: '포인트 잔액 조회 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 포인트 적립
   */
  async earnPoints(userId: string, amount: number, reason: string, referenceId?: string): Promise<PointResponse> {
    try {
      // 트랜잭션 시작
      const { data: transaction, error: transactionError } = await supabase.rpc(
        'add_points_transaction',
        {
          user_id: userId,
          amount: amount,
          reason: reason,
          reference_id: referenceId || null
        }
      );

      if (transactionError) {
        console.error('포인트 적립 실패:', transactionError);
        return { success: false, error: '포인트 적립에 실패했습니다.' };
      }

      // 사용자 상태 업데이트
      const authStore = useAuthStore.getState();
      if (authStore.user?.id === userId) {
        await authStore.refreshUser();
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '포인트 적립',
        message: `${amount} 포인트가 적립되었습니다.`
      });

      return {
        success: true,
        transaction: transaction
      };
    } catch (error) {
      console.error('포인트 적립 서비스 오류:', error);
      return { success: false, error: '포인트 적립 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 포인트 사용
   */
  async spendPoints(userId: string, amount: number, reason: string, referenceId?: string): Promise<PointResponse> {
    try {
      // 현재 잔액 확인
      const balanceResult = await this.getBalance(userId);
      if (!balanceResult.success || (balanceResult.balance || 0) < amount) {
        return { success: false, error: '포인트 잔액이 부족합니다.' };
      }

      // 트랜잭션 시작
      const { data: transaction, error: transactionError } = await supabase.rpc(
        'spend_points_transaction',
        {
          user_id: userId,
          amount: amount,
          reason: reason,
          reference_id: referenceId || null
        }
      );

      if (transactionError) {
        console.error('포인트 사용 실패:', transactionError);
        return { success: false, error: '포인트 사용에 실패했습니다.' };
      }

      // 사용자 상태 업데이트
      const authStore = useAuthStore.getState();
      if (authStore.user?.id === userId) {
        await authStore.refreshUser();
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'info',
        title: '포인트 사용',
        message: `${amount} 포인트를 사용했습니다.`
      });

      return {
        success: true,
        transaction: transaction
      };
    } catch (error) {
      console.error('포인트 사용 서비스 오류:', error);
      return { success: false, error: '포인트 사용 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 관리자 포인트 지급/차감
   */
  async adminAdjustPoints(userId: string, amount: number, reason: string, adminUserId: string): Promise<PointResponse> {
    try {
      const { data: transaction, error: transactionError } = await supabase.rpc(
        'admin_adjust_points',
        {
          target_user_id: userId,
          amount: amount,
          reason: reason,
          admin_user_id: adminUserId
        }
      );

      if (transactionError) {
        console.error('관리자 포인트 조정 실패:', transactionError);
        return { success: false, error: '포인트 조정에 실패했습니다.' };
      }

      // 사용자 상태 업데이트
      const authStore = useAuthStore.getState();
      if (authStore.user?.id === userId) {
        await authStore.refreshUser();
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '포인트 조정',
        message: `관리자에 의해 포인트가 ${amount > 0 ? '지급' : '차감'}되었습니다.`
      });

      return {
        success: true,
        transaction: transaction
      };
    } catch (error) {
      console.error('관리자 포인트 조정 서비스 오류:', error);
      return { success: false, error: '포인트 조정 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 포인트 내역 조회
   */
  async getTransactionHistory(
    filters: PointHistoryFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PointResponse> {
    try {
      let query = supabase
        .from('point_transactions')
        .select(`
          *,
          users!point_transactions_user_id_fkey (
            id,
            username,
            full_name
          )
        `, { count: 'exact' });

      // 필터 적용
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // 페이지네이션
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('포인트 내역 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as PointTransaction[]
      };
    } catch (error) {
      console.error('포인트 내역 서비스 오류:', error);
      return { success: false, error: '포인트 내역을 불러올 수 없습니다.' };
    }
  }

  /**
   * 포인트 랭킹 조회
   */
  async getPointsRanking(limit: number = 50): Promise<{
    success: boolean;
    data?: Array<{
      id: string;
      username: string;
      full_name: string;
      user_type: string;
      points: number;
      rank: number;
    }>;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, user_type, points')
        .eq('status', 'active')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('포인트 랭킹 조회 실패:', error);
        return { success: false, error: error.message };
      }

      // 랭킹 정보 추가
      const rankedData = data.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

      return {
        success: true,
        data: rankedData
      };
    } catch (error) {
      console.error('포인트 랭킹 서비스 오류:', error);
      return { success: false, error: '포인트 랭킹을 불러올 수 없습니다.' };
    }
  }

  /**
   * 내 포인트 랭킹 조회
   */
  async getMyRanking(userId: string): Promise<{
    success: boolean;
    rank?: number;
    points?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_user_point_rank', {
        target_user_id: userId
      });

      if (error) {
        console.error('내 랭킹 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        rank: data?.rank || 0,
        points: data?.points || 0
      };
    } catch (error) {
      console.error('내 랭킹 서비스 오류:', error);
      return { success: false, error: '랭킹 정보를 불러올 수 없습니다.' };
    }
  }

  /**
   * 포인트 정책 조회
   */
  async getPointPolicies(): Promise<{
    success: boolean;
    data?: Record<string, number>;
    error?: string;
  }> {
    try {
      // 포인트 정책은 설정 테이블이나 별도 정책 테이블에서 관리
      // 현재는 하드코딩된 정책을 반환
      const policies = {
        login_daily: 10,          // 일일 로그인
        post_create: 50,          // 게시글 작성
        comment_create: 10,       // 댓글 작성
        post_like_received: 5,    // 게시글 좋아요 받기
        attendance_daily: 20,     // 출석체크
        event_participation: 100, // 이벤트 참여
        referral_signup: 500,     // 추천 가입
        document_download: -10,   // 자료 다운로드 (차감)
        premium_content: -100,    // 프리미엄 컨텐츠 (차감)
      };

      return {
        success: true,
        data: policies
      };
    } catch (error) {
      console.error('포인트 정책 서비스 오류:', error);
      return { success: false, error: '포인트 정책을 불러올 수 없습니다.' };
    }
  }

  /**
   * 출석체크 포인트 지급
   */
  async dailyAttendance(userId: string): Promise<PointResponse> {
    try {
      // 오늘 이미 출석체크했는지 확인
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAttendance, error: checkError } = await supabase
        .from('point_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('reason', 'daily_attendance')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('출석체크 확인 실패:', checkError);
        return { success: false, error: '출석체크 확인에 실패했습니다.' };
      }

      if (existingAttendance) {
        return { success: false, error: '오늘 이미 출석체크를 완료했습니다.' };
      }

      // 출석체크 포인트 지급
      return await this.earnPoints(userId, 20, 'daily_attendance');
    } catch (error) {
      console.error('출석체크 서비스 오류:', error);
      return { success: false, error: '출석체크 중 오류가 발생했습니다.' };
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const pointService = PointService.getInstance();