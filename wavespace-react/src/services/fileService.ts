import { supabase } from '../lib/supabase/client';
import { useAppStore } from '../lib/zustand/appStore';

interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface DownloadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export class FileService {
  private static instance: FileService;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  private constructor() {}

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * 파일 유효성 검증
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // 파일 크기 검증
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다. 최대 ${this.maxFileSize / 1024 / 1024}MB까지 업로드 가능합니다.`
      };
    }

    // 파일 타입 검증
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '지원하지 않는 파일 형식입니다.'
      };
    }

    return { valid: true };
  }

  /**
   * 고유한 파일명 생성
   */
  private generateUniqueFileName(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    const prefix = userId ? `${userId}_` : '';
    return `${prefix}${baseName}_${timestamp}_${randomString}.${extension}`;
  }

  /**
   * 이미지 파일 업로드
   */
  async uploadImage(file: File, bucket: string = 'images', userId?: string): Promise<UploadResponse> {
    try {
      // 파일 유효성 검증
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // 이미지 타입만 허용
      if (!file.type.startsWith('image/')) {
        return { success: false, error: '이미지 파일만 업로드 가능합니다.' };
      }

      const fileName = this.generateUniqueFileName(file.name, userId);
      const filePath = userId ? `${userId}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('이미지 업로드 실패:', error);
        return { success: false, error: '이미지 업로드에 실패했습니다.' };
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '이미지 업로드 완료',
        message: '이미지가 성공적으로 업로드되었습니다.'
      });

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('이미지 업로드 서비스 오류:', error);
      return { success: false, error: '이미지 업로드 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 문서 파일 업로드
   */
  async uploadDocument(file: File, bucket: string = 'documents', userId?: string): Promise<UploadResponse> {
    try {
      // 파일 유효성 검증
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const fileName = this.generateUniqueFileName(file.name, userId);
      const filePath = userId ? `${userId}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('문서 업로드 실패:', error);
        return { success: false, error: '문서 업로드에 실패했습니다.' };
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '문서 업로드 완료',
        message: '문서가 성공적으로 업로드되었습니다.'
      });

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('문서 업로드 서비스 오류:', error);
      return { success: false, error: '문서 업로드 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 프로필 이미지 업로드
   */
  async uploadProfileImage(file: File, userId: string): Promise<UploadResponse> {
    try {
      // 이미지 타입 검증
      if (!file.type.startsWith('image/')) {
        return { success: false, error: '이미지 파일만 업로드 가능합니다.' };
      }

      // 기존 프로필 이미지 삭제
      await this.deleteProfileImage(userId);

      const fileName = `profile_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `profiles/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('프로필 이미지 업로드 실패:', error);
        return { success: false, error: '프로필 이미지 업로드에 실패했습니다.' };
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('프로필 이미지 업로드 서비스 오류:', error);
      return { success: false, error: '프로필 이미지 업로드 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 파일 다운로드 URL 생성
   */
  async getDownloadUrl(bucket: string, path: string): Promise<DownloadResponse> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1시간 유효

      if (error) {
        console.error('다운로드 URL 생성 실패:', error);
        return { success: false, error: '다운로드 링크 생성에 실패했습니다.' };
      }

      return {
        success: true,
        url: data.signedUrl
      };
    } catch (error) {
      console.error('다운로드 URL 서비스 오류:', error);
      return { success: false, error: '다운로드 링크 생성 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('파일 삭제 실패:', error);
        return { success: false, error: '파일 삭제에 실패했습니다.' };
      }

      return { success: true };
    } catch (error) {
      console.error('파일 삭제 서비스 오류:', error);
      return { success: false, error: '파일 삭제 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 프로필 이미지 삭제
   */
  async deleteProfileImage(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 기존 프로필 이미지 목록 조회
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list(`profiles`, {
          search: `profile_${userId}_`
        });

      if (listError) {
        console.error('프로필 이미지 목록 조회 실패:', listError);
        return { success: false, error: '기존 프로필 이미지 확인에 실패했습니다.' };
      }

      // 기존 파일들 삭제
      if (files && files.length > 0) {
        const filePaths = files.map(file => `profiles/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove(filePaths);

        if (deleteError) {
          console.error('기존 프로필 이미지 삭제 실패:', deleteError);
          // 삭제 실패해도 계속 진행
        }
      }

      return { success: true };
    } catch (error) {
      console.error('프로필 이미지 삭제 서비스 오류:', error);
      return { success: false, error: '프로필 이미지 삭제 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 파일 정보 가져오기
   */
  getFileInfo(file: File): FileInfo {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  }

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 이미지 미리보기 URL 생성
   */
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('파일 미리보기 생성 실패'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 다중 파일 업로드
   */
  async uploadMultipleFiles(
    files: File[],
    bucket: string = 'documents',
    userId?: string
  ): Promise<{ success: boolean; results: UploadResponse[]; error?: string }> {
    try {
      const uploadPromises = files.map(file => 
        file.type.startsWith('image/')
          ? this.uploadImage(file, bucket, userId)
          : this.uploadDocument(file, bucket, userId)
      );

      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        return {
          success: false,
          results,
          error: `${failedUploads.length}개 파일 업로드에 실패했습니다.`
        };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '파일 업로드 완료',
        message: `${files.length}개 파일이 성공적으로 업로드되었습니다.`
      });

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('다중 파일 업로드 서비스 오류:', error);
      return {
        success: false,
        results: [],
        error: '파일 업로드 중 오류가 발생했습니다.'
      };
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const fileService = FileService.getInstance();