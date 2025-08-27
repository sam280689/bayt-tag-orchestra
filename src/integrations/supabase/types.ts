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
      analytics_data: {
        Row: {
          dimensions: Json
          id: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          recorded_at: string
        }
        Insert: {
          dimensions?: Json
          id?: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          recorded_at?: string
        }
        Update: {
          dimensions?: Json
          id?: string
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          recorded_at?: string
        }
        Relationships: []
      }
      bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          id: string
          parameters: Json
          progress: number
          results: Json | null
          status: string
          targets: string[]
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          parameters?: Json
          progress?: number
          results?: Json | null
          status?: string
          targets: string[]
          type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          parameters?: Json
          progress?: number
          results?: Json | null
          status?: string
          targets?: string[]
          type?: string
        }
        Relationships: []
      }
      candidate_tags: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string
          id: string
          tag_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by: string
          id?: string
          tag_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_tags_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          profile_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          profile_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tag_relationships: {
        Row: {
          created_at: string
          id: string
          relationship_type: string
          source_tag_id: string
          strength: number
          target_tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_type: string
          source_tag_id: string
          strength?: number
          target_tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship_type?: string
          source_tag_id?: string
          strength?: number
          target_tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_relationships_source_tag_id_fkey"
            columns: ["source_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_relationships_target_tag_id_fkey"
            columns: ["target_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          created_by: string
          duplicates: string[] | null
          id: string
          last_used: string | null
          name: string
          type: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by: string
          duplicates?: string[] | null
          id?: string
          last_used?: string | null
          name: string
          type: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          duplicates?: string[] | null
          id?: string
          last_used?: string | null
          name?: string
          type?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          last_active: string | null
          permissions: Json
          role: string
          tag_stats: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_active?: string | null
          permissions?: Json
          role?: string
          tag_stats?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_active?: string | null
          permissions?: Json
          role?: string
          tag_stats?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_settings: {
        Row: {
          allow_public_tags: boolean
          auto_suggest_similar: boolean
          created_at: string
          enforce_naming_convention: boolean
          id: string
          max_tags_per_user: number
          require_approval: boolean
          updated_at: string
        }
        Insert: {
          allow_public_tags?: boolean
          auto_suggest_similar?: boolean
          created_at?: string
          enforce_naming_convention?: boolean
          id?: string
          max_tags_per_user?: number
          require_approval?: boolean
          updated_at?: string
        }
        Update: {
          allow_public_tags?: boolean
          auto_suggest_similar?: boolean
          created_at?: string
          enforce_naming_convention?: boolean
          id?: string
          max_tags_per_user?: number
          require_approval?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          executed_at: string
          id: string
          results: Json | null
          rule_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          results?: Json | null
          rule_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          results?: Json | null
          rule_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "workflow_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string
          description: string | null
          enabled: boolean
          execution_count: number
          id: string
          last_executed: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by: string
          description?: string | null
          enabled?: boolean
          execution_count?: number
          id?: string
          last_executed?: string | null
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          enabled?: boolean
          execution_count?: number
          id?: string
          last_executed?: string | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_tag_usage: {
        Args: { tag_id: string }
        Returns: undefined
      }
      increment_tag_usage: {
        Args: { tag_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
