export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          grade_level: string | null;
          subjects: string[] | null;
          subscription_tier: string;
          trial_ends_at: string | null;
          is_admin: boolean;
          coupon_code: string | null;
          api_calls_used: number;
          created_at: string;
        };
        Insert: {
          id: string;
          grade_level?: string | null;
          subjects?: string[] | null;
          subscription_tier?: string;
          trial_ends_at?: string | null;
          is_admin?: boolean;
          coupon_code?: string | null;
          api_calls_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          grade_level?: string | null;
          subjects?: string[] | null;
          subscription_tier?: string;
          trial_ends_at?: string | null;
          is_admin?: boolean;
          coupon_code?: string | null;
          api_calls_used?: number;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          module: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          module: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          module?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      abitur_exams: {
        Row: {
          id: string;
          year: number;
          state: string;
          file_url: string;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          state: string;
          file_url: string;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          year?: number;
          state?: string;
          file_url?: string;
          processed_at?: string | null;
          created_at?: string;
        };
      };
      abitur_tasks: {
        Row: {
          id: string;
          exam_id: string;
          question_number: number;
          sub_part: string | null;
          subject_area: string;
          requirement_level: string;
          question_text: string;
          solution_text: string;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_number: number;
          sub_part?: string | null;
          subject_area: string;
          requirement_level: string;
          question_text: string;
          solution_text: string;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          question_number?: number;
          sub_part?: string | null;
          subject_area?: string;
          requirement_level?: string;
          question_text?: string;
          solution_text?: string;
          published?: boolean;
          created_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          topic: string;
          mastery_pct: number;
          last_practiced_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          topic: string;
          mastery_pct?: number;
          last_practiced_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          topic?: string;
          mastery_pct?: number;
          last_practiced_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tier: string | null;
          status: string | null;
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string | null;
          status?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string | null;
          status?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
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
      [_ in never]: never;
    };
  };
}
