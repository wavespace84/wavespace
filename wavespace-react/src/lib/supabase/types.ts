// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          username: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          user_type: 'planning' | 'sales' | 'consulting' | 'related' | 'general';
          role: 'admin' | 'practitioner' | 'member';
          status: 'pending' | 'active' | 'suspended' | 'deleted';
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          username: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          user_type: 'planning' | 'sales' | 'consulting' | 'related' | 'general';
          role?: 'admin' | 'practitioner' | 'member';
          status?: 'pending' | 'active' | 'suspended' | 'deleted';
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          username?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          user_type?: 'planning' | 'sales' | 'consulting' | 'related' | 'general';
          role?: 'admin' | 'practitioner' | 'member';
          status?: 'pending' | 'active' | 'suspended' | 'deleted';
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          avatar_url: string | null;
          bio: string | null;
          company: string | null;
          position: string | null;
          experience_years: number | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          position?: string | null;
          experience_years?: number | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          position?: string | null;
          experience_years?: number | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          status: 'draft' | 'published' | 'archived';
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          status?: 'draft' | 'published' | 'archived';
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          content?: string;
          status?: 'draft' | 'published' | 'archived';
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          status: 'active' | 'deleted';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          status?: 'active' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          status?: 'active' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'earn' | 'spend' | 'admin';
          amount: number;
          reason: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'earn' | 'spend' | 'admin';
          amount: number;
          reason: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'earn' | 'spend' | 'admin';
          amount?: number;
          reason?: string;
          reference_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_type: 'planning' | 'sales' | 'consulting' | 'related' | 'general';
      user_role: 'admin' | 'practitioner' | 'member';
      user_status: 'pending' | 'active' | 'suspended' | 'deleted';
      post_status: 'draft' | 'published' | 'archived';
      transaction_type: 'earn' | 'spend' | 'admin';
    };
  };
}

// 편의를 위한 타입 별칭
export type User = Database['public']['Tables']['users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type PointTransaction = Database['public']['Tables']['point_transactions']['Row'];

export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type PointTransactionInsert = Database['public']['Tables']['point_transactions']['Insert'];

export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];
export type PointTransactionUpdate = Database['public']['Tables']['point_transactions']['Update'];