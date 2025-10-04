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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brand_settings: {
        Row: {
          brand_book_rules: Json | null
          brand_name: string
          brand_values: string
          competitor_brands: string[] | null
          content_guidelines: Json | null
          created_at: string
          id: string
          instagram_handle: string | null
          logo_url: string | null
          preferred_keywords: string | null
          preferred_style: string
          primary_color: string
          secondary_color: string
          target_market: string
          tone_examples: Json | null
          tone_of_voice: string
          updated_at: string
          user_id: string
          validation_strictness: string | null
          website: string | null
          words_to_avoid: string | null
        }
        Insert: {
          brand_book_rules?: Json | null
          brand_name: string
          brand_values: string
          competitor_brands?: string[] | null
          content_guidelines?: Json | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          preferred_keywords?: string | null
          preferred_style: string
          primary_color?: string
          secondary_color?: string
          target_market: string
          tone_examples?: Json | null
          tone_of_voice: string
          updated_at?: string
          user_id: string
          validation_strictness?: string | null
          website?: string | null
          words_to_avoid?: string | null
        }
        Update: {
          brand_book_rules?: Json | null
          brand_name?: string
          brand_values?: string
          competitor_brands?: string[] | null
          content_guidelines?: Json | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          preferred_keywords?: string | null
          preferred_style?: string
          primary_color?: string
          secondary_color?: string
          target_market?: string
          tone_examples?: Json | null
          tone_of_voice?: string
          updated_at?: string
          user_id?: string
          validation_strictness?: string | null
          website?: string | null
          words_to_avoid?: string | null
        }
        Relationships: []
      }
      brand_validations: {
        Row: {
          adjustments_made: Json | null
          campaign_id: string | null
          corrected_content: Json | null
          created_at: string
          id: string
          original_content: Json
          user_approved: boolean | null
          user_id: string
          validation_score: number | null
        }
        Insert: {
          adjustments_made?: Json | null
          campaign_id?: string | null
          corrected_content?: Json | null
          created_at?: string
          id?: string
          original_content: Json
          user_approved?: boolean | null
          user_id: string
          validation_score?: number | null
        }
        Update: {
          adjustments_made?: Json | null
          campaign_id?: string | null
          corrected_content?: Json | null
          created_at?: string
          id?: string
          original_content?: Json
          user_approved?: boolean | null
          user_id?: string
          validation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_validations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          accessories_images: Json | null
          brand_compliance_adjustments: Json | null
          brand_compliance_score: number | null
          centerpiece_image: string
          created_at: string
          id: string
          image_analysis: Json | null
          instagram: Json
          long_description: string
          look_visual: string
          model_image: string | null
          prompt: string
          published_at: string | null
          scheduled_at: string | null
          short_description: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accessories_images?: Json | null
          brand_compliance_adjustments?: Json | null
          brand_compliance_score?: number | null
          centerpiece_image: string
          created_at?: string
          id?: string
          image_analysis?: Json | null
          instagram: Json
          long_description: string
          look_visual: string
          model_image?: string | null
          prompt: string
          published_at?: string | null
          scheduled_at?: string | null
          short_description: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accessories_images?: Json | null
          brand_compliance_adjustments?: Json | null
          brand_compliance_score?: number | null
          centerpiece_image?: string
          created_at?: string
          id?: string
          image_analysis?: Json | null
          instagram?: Json
          long_description?: string
          look_visual?: string
          model_image?: string | null
          prompt?: string
          published_at?: string | null
          scheduled_at?: string | null
          short_description?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          id: string
          tutorial_completed: boolean | null
          tutorial_skipped: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          tutorial_completed?: boolean | null
          tutorial_skipped?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          tutorial_completed?: boolean | null
          tutorial_skipped?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
