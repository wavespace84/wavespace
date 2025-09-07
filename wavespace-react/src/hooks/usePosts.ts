import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';
import type { Post, PostInsert, PostUpdate } from '../lib/supabase/types';
import { useAuth } from './useAuth';

interface UsePostsReturn {
  // State
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPosts: (page?: number) => Promise<void>;
  createPost: (postData: PostInsert) => Promise<{ success: boolean; error?: string }>;
  updatePost: (id: string, postData: PostUpdate) => Promise<{ success: boolean; error?: string }>;
  deletePost: (id: string) => Promise<{ success: boolean; error?: string }>;
  likePost: (id: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
  
  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
  
  // Search & Filter
  searchPosts: (query: string) => Promise<void>;
  filterPosts: (filters: any) => Promise<void>;
}

interface UsePostsOptions {
  autoFetch?: boolean;
  pageSize?: number;
  filters?: {
    category?: string;
    status?: 'draft' | 'published' | 'archived';
    userId?: string;
    search?: string;
  };
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const { autoFetch = true, pageSize = 20, filters = {} } = options;
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentFilters, setCurrentFilters] = useState(filters);

  // 게시글 목록 조회
  const fetchPosts = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await postService.getPosts(
        currentFilters,
        { page, limit: pageSize }
      );

      if (response.success && response.data) {
        if (page === 1) {
          setPosts(response.data);
        } else {
          setPosts(prev => [...prev, ...response.data!]);
        }
        
        setTotal(response.total || 0);
        setHasMore((response.data.length === pageSize) && ((page * pageSize) < (response.total || 0)));
        setCurrentPage(page);
      } else {
        setError(response.error || '게시글을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('게시글 조회 중 오류가 발생했습니다.');
      console.error('게시글 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, pageSize]);

  // 게시글 생성
  const createPost = useCallback(async (postData: PostInsert) => {
    try {
      const response = await postService.createPost(postData);
      
      if (response.success && response.post) {
        // 새 게시글을 목록 맨 앞에 추가
        setPosts(prev => [response.post!, ...prev]);
        setTotal(prev => prev + 1);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 생성 오류:', err);
      return { success: false, error: '게시글 생성 중 오류가 발생했습니다.' };
    }
  }, []);

  // 게시글 수정
  const updatePost = useCallback(async (id: string, postData: PostUpdate) => {
    try {
      const response = await postService.updatePost(id, postData);
      
      if (response.success && response.post) {
        // 로컬 상태에서 해당 게시글 업데이트
        setPosts(prev => 
          prev.map(post => 
            post.id === id ? response.post! : post
          )
        );
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 수정 오류:', err);
      return { success: false, error: '게시글 수정 중 오류가 발생했습니다.' };
    }
  }, []);

  // 게시글 삭제
  const deletePost = useCallback(async (id: string) => {
    try {
      const response = await postService.deletePost(id);
      
      if (response.success) {
        // 로컬 상태에서 해당 게시글 제거
        setPosts(prev => prev.filter(post => post.id !== id));
        setTotal(prev => Math.max(0, prev - 1));
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      return { success: false, error: '게시글 삭제 중 오류가 발생했습니다.' };
    }
  }, []);

  // 게시글 좋아요
  const likePost = useCallback(async (id: string) => {
    try {
      const response = await postService.likePost(id);
      
      if (response.success) {
        // 로컬 상태에서 좋아요 수 증가
        setPosts(prev => 
          prev.map(post => 
            post.id === id 
              ? { ...post, likes: (post.likes || 0) + 1 }
              : post
          )
        );
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 좋아요 오류:', err);
      return { success: false, error: '좋아요 처리 중 오류가 발생했습니다.' };
    }
  }, []);

  // 새로고침
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchPosts(1);
  }, [fetchPosts]);

  // 더 많은 게시글 로드
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchPosts(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, fetchPosts]);

  // 게시글 검색
  const searchPosts = useCallback(async (query: string) => {
    const newFilters = { ...currentFilters, search: query };
    setCurrentFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await postService.searchPosts(query, newFilters, { page: 1, limit: pageSize });
      
      if (response.success && response.data) {
        setPosts(response.data);
        setTotal(response.total || 0);
        setHasMore(response.data.length === pageSize);
      } else {
        setError(response.error || '검색 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      console.error('게시글 검색 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, pageSize]);

  // 필터 적용
  const filterPosts = useCallback(async (newFilters: any) => {
    setCurrentFilters({ ...currentFilters, ...newFilters });
    setCurrentPage(1);
    setHasMore(true);
    await fetchPosts(1);
  }, [currentFilters, fetchPosts]);

  // 초기 데이터 로드
  useEffect(() => {
    if (autoFetch) {
      fetchPosts(1);
    }
  }, [autoFetch, fetchPosts]);

  // 필터 변경 시 재조회
  useEffect(() => {
    if (JSON.stringify(currentFilters) !== JSON.stringify(filters)) {
      setCurrentFilters(filters);
      refresh();
    }
  }, [filters, currentFilters, refresh]);

  return {
    // State
    posts,
    isLoading,
    error,
    
    // Actions
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    refresh,
    
    // Pagination
    hasMore,
    loadMore,
    
    // Search & Filter
    searchPosts,
    filterPosts
  };
};

// 단일 게시글용 훅
interface UsePostReturn {
  post: Post | null;
  isLoading: boolean;
  error: string | null;
  fetchPost: () => Promise<void>;
  updatePost: (postData: PostUpdate) => Promise<{ success: boolean; error?: string }>;
  deletePost: () => Promise<{ success: boolean; error?: string }>;
  likePost: () => Promise<{ success: boolean; error?: string }>;
}

export const usePost = (postId: string): UsePostReturn => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게시글 조회
  const fetchPost = useCallback(async () => {
    if (!postId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await postService.getPost(postId);
      
      if (response.success && response.post) {
        setPost(response.post);
      } else {
        setError(response.error || '게시글을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('게시글 조회 중 오류가 발생했습니다.');
      console.error('게시글 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // 게시글 수정
  const updatePost = useCallback(async (postData: PostUpdate) => {
    if (!postId) return { success: false, error: '게시글 ID가 없습니다.' };

    try {
      const response = await postService.updatePost(postId, postData);
      
      if (response.success && response.post) {
        setPost(response.post);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 수정 오류:', err);
      return { success: false, error: '게시글 수정 중 오류가 발생했습니다.' };
    }
  }, [postId]);

  // 게시글 삭제
  const deletePost = useCallback(async () => {
    if (!postId) return { success: false, error: '게시글 ID가 없습니다.' };

    try {
      const response = await postService.deletePost(postId);
      
      if (response.success) {
        setPost(null);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      return { success: false, error: '게시글 삭제 중 오류가 발생했습니다.' };
    }
  }, [postId]);

  // 게시글 좋아요
  const likePost = useCallback(async () => {
    if (!postId || !post) return { success: false, error: '게시글 정보가 없습니다.' };

    try {
      const response = await postService.likePost(postId);
      
      if (response.success) {
        setPost(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
      
      return { success: response.success, error: response.error };
    } catch (err) {
      console.error('게시글 좋아요 오류:', err);
      return { success: false, error: '좋아요 처리 중 오류가 발생했습니다.' };
    }
  }, [postId, post]);

  // 초기 데이터 로드
  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

  return {
    post,
    isLoading,
    error,
    fetchPost,
    updatePost,
    deletePost,
    likePost
  };
};