import { supabase } from '../lib/supabase/client';
import type { Post, PostInsert, PostUpdate } from '../lib/supabase/types';
import { useAppStore } from '../lib/zustand/appStore';

interface PostFilters {
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  userId?: string;
  search?: string;
}

interface PostPagination {
  page: number;
  limit: number;
}

interface PostResponse {
  success: boolean;
  data?: Post[];
  post?: Post;
  total?: number;
  error?: string;
}

export class PostService {
  private static instance: PostService;
  
  private constructor() {}
  
  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  /**
   * 게시글 목록 조회
   */
  async getPosts(filters: PostFilters = {}, pagination: PostPagination = { page: 1, limit: 20 }): Promise<PostResponse> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          )
        `, { count: 'exact' });

      // 필터 적용
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // 기본적으로 게시된 글만 표시
        query = query.eq('status', 'published');
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      // 페이지네이션
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('게시글 목록 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as Post[],
        total: count || 0
      };
    } catch (error) {
      console.error('게시글 서비스 오류:', error);
      return { success: false, error: '게시글 목록을 불러올 수 없습니다.' };
    }
  }

  /**
   * 게시글 상세 조회
   */
  async getPost(id: string): Promise<PostResponse> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          ),
          comments (
            id,
            content,
            created_at,
            users!comments_user_id_fkey (
              id,
              username,
              full_name
            )
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('게시글 조회 실패:', error);
        return { success: false, error: '게시글을 찾을 수 없습니다.' };
      }

      // 조회수 증가
      await this.incrementViews(id);

      return {
        success: true,
        post: data as Post
      };
    } catch (error) {
      console.error('게시글 상세 조회 오류:', error);
      return { success: false, error: '게시글을 불러올 수 없습니다.' };
    }
  }

  /**
   * 게시글 생성
   */
  async createPost(postData: PostInsert): Promise<PostResponse> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          )
        `)
        .single();

      if (error) {
        console.error('게시글 생성 실패:', error);
        return { success: false, error: '게시글 생성에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '게시글 작성 완료',
        message: '게시글이 성공적으로 작성되었습니다.'
      });

      return {
        success: true,
        post: data as Post
      };
    } catch (error) {
      console.error('게시글 생성 서비스 오류:', error);
      return { success: false, error: '게시글 생성 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 게시글 수정
   */
  async updatePost(id: string, postData: PostUpdate): Promise<PostResponse> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          )
        `)
        .single();

      if (error) {
        console.error('게시글 수정 실패:', error);
        return { success: false, error: '게시글 수정에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '게시글 수정 완료',
        message: '게시글이 성공적으로 수정되었습니다.'
      });

      return {
        success: true,
        post: data as Post
      };
    } catch (error) {
      console.error('게시글 수정 서비스 오류:', error);
      return { success: false, error: '게시글 수정 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 게시글 삭제
   */
  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('게시글 삭제 실패:', error);
        return { success: false, error: '게시글 삭제에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '게시글 삭제 완료',
        message: '게시글이 성공적으로 삭제되었습니다.'
      });

      return { success: true };
    } catch (error) {
      console.error('게시글 삭제 서비스 오류:', error);
      return { success: false, error: '게시글 삭제 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 게시글 좋아요
   */
  async likePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 현재 좋아요 수 조회
      const { data: currentPost, error: fetchError } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('게시글 조회 실패:', fetchError);
        return { success: false, error: '게시글을 찾을 수 없습니다.' };
      }

      // 좋아요 수 증가
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          likes: (currentPost.likes || 0) + 1,
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
   * 조회수 증가 (내부 메서드)
   */
  private async incrementViews(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_post_views', { post_id: id });
    } catch (error) {
      console.error('조회수 증가 실패:', error);
      // 조회수 증가 실패는 사용자에게 에러로 표시하지 않음
    }
  }

  /**
   * 내가 작성한 게시글 조회
   */
  async getMyPosts(userId: string, pagination: PostPagination = { page: 1, limit: 20 }): Promise<PostResponse> {
    return this.getPosts({ userId }, pagination);
  }

  /**
   * 게시글 검색
   */
  async searchPosts(query: string, filters: Omit<PostFilters, 'search'> = {}, pagination: PostPagination = { page: 1, limit: 20 }): Promise<PostResponse> {
    return this.getPosts({ ...filters, search: query }, pagination);
  }

  /**
   * 인기 게시글 조회
   */
  async getPopularPosts(category?: string, limit: number = 10): Promise<PostResponse> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            full_name,
            user_type
          )
        `)
        .eq('status', 'published')
        .order('views', { ascending: false })
        .order('likes', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('인기 게시글 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as Post[]
      };
    } catch (error) {
      console.error('인기 게시글 서비스 오류:', error);
      return { success: false, error: '인기 게시글을 불러올 수 없습니다.' };
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const postService = PostService.getInstance();