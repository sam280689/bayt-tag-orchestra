export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      account_status: {
        Row: {
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          amount: number
          course_completed_at: string | null
          course_id: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          enrolled_at: string | null
          id: string
          order_id: string
          payment_id: string
          payment_status: string
          refund_eligible_until: string
          refund_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          course_completed_at?: string | null
          course_id: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          enrolled_at?: string | null
          id?: string
          order_id: string
          payment_id: string
          payment_status?: string
          refund_eligible_until: string
          refund_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          course_completed_at?: string | null
          course_id?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          enrolled_at?: string | null
          id?: string
          order_id?: string
          payment_id?: string
          payment_status?: string
          refund_eligible_until?: string
          refund_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lectures: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_preview: boolean | null
          order_index: number
          resources: string[] | null
          section_id: string
          title: string
          updated_at: string
          video_duration: number | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_preview?: boolean | null
          order_index: number
          resources?: string[] | null
          section_id: string
          title: string
          updated_at?: string
          video_duration?: number | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_preview?: boolean | null
          order_index?: number
          resources?: string[] | null
          section_id?: string
          title?: string
          updated_at?: string
          video_duration?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lectures_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_notes: {
        Row: {
          course_id: string
          created_at: string
          id: string
          note_path: string
          page_number: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          note_path: string
          page_number?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          note_path?: string
          page_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_notes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_questions: {
        Row: {
          course_id: string
          created_at: string
          id: string
          lecture_id: string | null
          question: string
          student_id: string
          title: string
          updated_at: string
          upvotes: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          lecture_id?: string | null
          question: string
          student_id: string
          title: string
          updated_at?: string
          upvotes?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          lecture_id?: string | null
          question?: string
          student_id?: string
          title?: string
          updated_at?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_questions_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "course_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_wishlists: {
        Row: {
          course_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_wishlists_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          average_rating: number | null
          category_id: string | null
          content_type: string | null
          created_at: string
          currency: string | null
          description: string | null
          document_path: string | null
          estimated_time: string | null
          id: string
          is_published: boolean
          language: string | null
          learning_objectives: string[] | null
          level: Database["public"]["Enums"]["course_level"] | null
          original_price: number | null
          prerequisites: string | null
          preview_video_url: string | null
          price: number | null
          requirements: string[] | null
          status: Database["public"]["Enums"]["course_status"] | null
          thumbnail_url: string | null
          title: string
          total_duration: number | null
          total_enrollments: number | null
          total_lectures: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          video_path: string | null
          video_type: string
          video_url: string | null
          who_is_for: string[] | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          document_path?: string | null
          estimated_time?: string | null
          id?: string
          is_published?: boolean
          language?: string | null
          learning_objectives?: string[] | null
          level?: Database["public"]["Enums"]["course_level"] | null
          original_price?: number | null
          prerequisites?: string | null
          preview_video_url?: string | null
          price?: number | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["course_status"] | null
          thumbnail_url?: string | null
          title: string
          total_duration?: number | null
          total_enrollments?: number | null
          total_lectures?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          video_path?: string | null
          video_type: string
          video_url?: string | null
          who_is_for?: string[] | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          document_path?: string | null
          estimated_time?: string | null
          id?: string
          is_published?: boolean
          language?: string | null
          learning_objectives?: string[] | null
          level?: Database["public"]["Enums"]["course_level"] | null
          original_price?: number | null
          prerequisites?: string | null
          preview_video_url?: string | null
          price?: number | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["course_status"] | null
          thumbnail_url?: string | null
          title?: string
          total_duration?: number | null
          total_enrollments?: number | null
          total_lectures?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          video_path?: string | null
          video_type?: string
          video_url?: string | null
          who_is_for?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_payouts: {
        Row: {
          course_id: string
          created_at: string
          currency: string | null
          enrollment_id: string
          gross_amount: number
          id: string
          instructor_amount: number
          instructor_id: string
          platform_fee: number
          processed_at: string | null
          status: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          currency?: string | null
          enrollment_id: string
          gross_amount: number
          id?: string
          instructor_amount: number
          instructor_id: string
          platform_fee: number
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          currency?: string | null
          enrollment_id?: string
          gross_amount?: number
          id?: string
          instructor_amount?: number
          instructor_id?: string
          platform_fee?: number
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_payouts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_payouts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_notes: {
        Row: {
          created_at: string
          id: string
          lecture_id: string
          note_text: string
          student_id: string
          timestamp_seconds: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lecture_id: string
          note_text: string
          student_id: string
          timestamp_seconds?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lecture_id?: string
          note_text?: string
          student_id?: string
          timestamp_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecture_notes_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "course_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_position: number | null
          lecture_id: string
          student_id: string
          updated_at: string
          watched_duration: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          lecture_id: string
          student_id: string
          updated_at?: string
          watched_duration?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          lecture_id?: string
          student_id?: string
          updated_at?: string
          watched_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lecture_progress_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "course_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      module_documents: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          module_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          module_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          module_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          module_id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          module_id: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          receipt_url: string | null
          status: string
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          receipt_url?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          receipt_url?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_instructor_answer: boolean | null
          question_id: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_instructor_answer?: boolean | null
          question_id: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_instructor_answer?: boolean | null
          question_id?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "course_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      role_feature_access: {
        Row: {
          enabled: boolean
          feature: Database["public"]["Enums"]["app_feature"]
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          enabled?: boolean
          feature: Database["public"]["Enums"]["app_feature"]
          id?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          enabled?: boolean
          feature?: Database["public"]["Enums"]["app_feature"]
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          amount_paid: number | null
          completed_at: string | null
          course_id: string
          created_at: string
          currency: string | null
          enrolled_at: string
          id: string
          last_accessed_at: string | null
          payment_id: string | null
          progress_percentage: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          currency?: string | null
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          payment_id?: string | null
          progress_percentage?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          currency?: string | null
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          payment_id?: string | null
          progress_percentage?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          is_active: boolean
          last_login: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      bulk_set_feature_access: {
        Args: {
          _enabled: boolean
          _feature: Database["public"]["Enums"]["app_feature"]
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      bulk_set_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_ids: string[]
        }
        Returns: undefined
      }
      check_quiz_answers: {
        Args: { quiz_uuid: string; user_answers: Json }
        Returns: {
          correct_answers: number
          correct_index: number
          explanation: string
          is_correct: boolean
          question_id: string
          total_questions: number
        }[]
      }
      feature_enabled_for_user: {
        Args: { _feature: Database["public"]["Enums"]["app_feature"] }
        Returns: boolean
      }
      get_quiz_questions_for_students: {
        Args: { quiz_uuid: string }
        Returns: {
          id: string
          options: Json
          text: string
        }[]
      }
      get_quiz_questions_for_taking: {
        Args: { quiz_uuid: string }
        Returns: {
          explanation: string
          id: string
          options: Json
          text: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_assignment_submissions: {
        Args: { _assignment_id: string }
        Returns: {
          created_at: string
          email: string
          feedback: string
          file_path: string
          grade: number
          id: string
          student_id: string
        }[]
      }
      list_public_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          due_date: string
          estimated_hours: number
          id: string
          title: string
          updated_at: string
        }[]
      }
      list_public_assignments_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          due_date: string
          estimated_hours: number
          id: string
          title: string
          updated_at: string
        }[]
      }
      list_public_courses: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          estimated_time: string
          id: string
          title: string
          updated_at: string
          video_type: string
        }[]
      }
      list_public_courses_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          estimated_time: string
          id: string
          title: string
          updated_at: string
          video_type: string
        }[]
      }
      list_public_quizzes_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          id: string
          title: string
          updated_at: string
        }[]
      }
      set_account_status: {
        Args: { _is_active: boolean; _user_id: string }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_feature:
        | "courses"
        | "assignments"
        | "quizzes"
        | "mock_interviews"
        | "peer_interviews"
        | "dashboard"
      app_role: "admin" | "instructor" | "student"
      course_level: "beginner" | "intermediate" | "advanced" | "all_levels"
      course_status: "draft" | "pending_review" | "published" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_feature: [
        "courses",
        "assignments",
        "quizzes",
        "mock_interviews",
        "peer_interviews",
        "dashboard",
      ],
      app_role: ["admin", "instructor", "student"],
      course_level: ["beginner", "intermediate", "advanced", "all_levels"],
      course_status: ["draft", "pending_review", "published", "suspended"],
    },
  },
} as const
