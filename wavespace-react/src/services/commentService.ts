import { supabase } from '../lib/supabase/client';
import type { Comment, CommentInsert, CommentUpdate } from '../lib/supabase/types';
import { useAppStore } from '../lib/zustand/appStore';

interface CommentResponse {
  success: boolean;
  data?: Comment[];
  comment?: Comment;
  total?: number;
  error?: string;
}

interface CommentFilters {
  postId?: string;
  userId?: string;
  parentId?: string;
}

interface CommentPagination {
  page: number;
  limit: number;
}

export class CommentService {
  private static instance: CommentService;
  
  private constructor() {}
  
  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  /**
   * 댓글 목록 조회
   */
  async getComments(
    filters: CommentFilters = {},
    pagination: CommentPagination = { page: 1, limit: 20 }
  ): Promise<CommentResponse> {
    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          users!comments_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          ),
          replies:comments!parent_id (
            *,
            users!comments_user_id_fkey (
              id,
              username,
              full_name
            )
          )
        `, { count: 'exact' });

      // 필터 적용
      if (filters.postId) {
        query = query.eq('post_id', filters.postId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.parentId) {
        query = query.eq('parent_id', filters.parentId);
      } else {
        // 기본적으로 최상위 댓글만 조회 (답글 제외)
        query = query.is('parent_id', null);
      }

      // 페이지네이션
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;

      query = query
        .order('created_at', { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('댓글 목록 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as Comment[],
        total: count || 0
      };
    } catch (error) {
      console.error('댓글 서비스 오류:', error);
      return { success: false, error: '댓글 목록을 불러올 수 없습니다.' };
    }
  }

  /**
   * 댓글 상세 조회
   */
  async getComment(id: string): Promise<CommentResponse> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users!comments_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          ),
          replies:comments!parent_id (
            *,
            users!comments_user_id_fkey (
              id,
              username,
              full_name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('댓글 조회 실패:', error);
        return { success: false, error: '댓글을 찾을 수 없습니다.' };
      }

      return {
        success: true,
        comment: data as Comment
      };
    } catch (error) {
      console.error('댓글 상세 조회 오류:', error);
      return { success: false, error: '댓글을 불러올 수 없습니다.' };
    }
  }

  /**
   * 댓글 생성
   */
  async createComment(commentData: CommentInsert): Promise<CommentResponse> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          ...commentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          users!comments_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          )
        `)
        .single();

      if (error) {
        console.error('댓글 생성 실패:', error);
        return { success: false, error: '댓글 작성에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '댓글 작성 완료',
        message: '댓글이 성공적으로 작성되었습니다.'
      });

      return {
        success: true,
        comment: data as Comment
      };
    } catch (error) {
      console.error('댓글 생성 서비스 오류:', error);
      return { success: false, error: '댓글 작성 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 댓글 수정
   */
  async updateComment(id: string, commentData: CommentUpdate): Promise<CommentResponse> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          ...commentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          users!comments_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          )
        `)
        .single();

      if (error) {
        console.error('댓글 수정 실패:', error);
        return { success: false, error: '댓글 수정에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '댓글 수정 완료',
        message: '댓글이 성공적으로 수정되었습니다.'
      });

      return {
        success: true,
        comment: data as Comment
      };
    } catch (error) {
      console.error('댓글 수정 서비스 오류:', error);
      return { success: false, error: '댓글 수정 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('댓글 삭제 실패:', error);
        return { success: false, error: '댓글 삭제에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '댓글 삭제 완료',
        message: '댓글이 성공적으로 삭제되었습니다.'
      });

      return { success: true };
    } catch (error) {
      console.error('댓글 삭제 서비스 오류:', error);
      return { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 댓글 좋아요
   */
  async likeComment(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 현재 좋아요 수 조회
      const { data: currentComment, error: fetchError } = await supabase
        .from('comments')
        .select('likes')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('댓글 조회 실패:', fetchError);
        return { success: false, error: '댓글을 찾을 수 없습니다.' };
      }

      // 좋아요 수 증가
      const { error: updateError } = await supabase
        .from('comments')
        .update({
          likes: (currentComment.likes || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('좋아요 업데이트 실패:', updateError);
        return { success: false, error: '좋아요 처리에 실패했습니다.' };
      }

      return { success: true };
    } catch (error) {
      console.error('좋아요 서비스 오류:', error);
      return { success: false, error: '좋아요 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 게시글의 댓글 수 조회
   */
  async getCommentCount(postId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('댓글 수 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        count: count || 0
      };
    } catch (error) {
      console.error('댓글 수 서비스 오류:', error);
      return { success: false, error: '댓글 수를 조회할 수 없습니다.' };
    }
  }

  /**
   * 사용자의 댓글 목록 조회
   */
  async getUserComments(
    userId: string,
    pagination: CommentPagination = { page: 1, limit: 20 }
  ): Promise<CommentResponse> {
    return this.getComments({ userId }, pagination);
  }

  /**
   * 답글 생성
   */
  async createReply(parentId: string, commentData: Omit<CommentInsert, 'parent_id'>): Promise<CommentResponse> {
    return this.createComment({
      ...commentData,
      parent_id: parentId
    });
  }

  /**
   * 답글 목록 조회
   */
  async getReplies(
    parentId: string,
    pagination: CommentPagination = { page: 1, limit: 10 }
  ): Promise<CommentResponse> {
    return this.getComments({ parentId }, pagination);
  }
}

// 싱글톤 인스턴스 내보내기
export const commentService = CommentService.getInstance();