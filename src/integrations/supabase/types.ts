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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      endgame_levels: {
        Row: {
          brief_en: string
          brief_zh: string
          code: string
          depth: number
          diamond_reward: number
          elo_required: number
          elo_reward: number
          explanation_en: string
          explanation_zh: string
          fen: string
          hint_en: string
          hint_zh: string
          id: number
          move_annotations: Json
          moves_to_mate: number
          name_en: string
          name_zh: string
          objective_en: string
          objective_zh: string
          theme_en: string
          theme_zh: string
        }
        Insert: {
          brief_en: string
          brief_zh: string
          code: string
          depth?: number
          diamond_reward?: number
          elo_required?: number
          elo_reward?: number
          explanation_en?: string
          explanation_zh?: string
          fen: string
          hint_en?: string
          hint_zh?: string
          id: number
          move_annotations?: Json
          moves_to_mate?: number
          name_en: string
          name_zh: string
          objective_en: string
          objective_zh: string
          theme_en?: string
          theme_zh?: string
        }
        Update: {
          brief_en?: string
          brief_zh?: string
          code?: string
          depth?: number
          diamond_reward?: number
          elo_required?: number
          elo_reward?: number
          explanation_en?: string
          explanation_zh?: string
          fen?: string
          hint_en?: string
          hint_zh?: string
          id?: number
          move_annotations?: Json
          moves_to_mate?: number
          name_en?: string
          name_zh?: string
          objective_en?: string
          objective_zh?: string
          theme_en?: string
          theme_zh?: string
        }
        Relationships: []
      }
      endgame_progress: {
        Row: {
          attempts: number
          best_ms: number | null
          id: string
          level_id: number
          reward_granted: boolean
          solved: boolean
          solved_at: string | null
          user_id: string
          viewed_explanation: boolean
        }
        Insert: {
          attempts?: number
          best_ms?: number | null
          id?: string
          level_id: number
          reward_granted?: boolean
          solved?: boolean
          solved_at?: string | null
          user_id: string
          viewed_explanation?: boolean
        }
        Update: {
          attempts?: number
          best_ms?: number | null
          id?: string
          level_id?: number
          reward_granted?: boolean
          solved?: boolean
          solved_at?: string | null
          user_id?: string
          viewed_explanation?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "endgame_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "endgame_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      endgame_solutions: {
        Row: {
          alternate_solutions: Json
          level_id: number
          solution: string[]
        }
        Insert: {
          alternate_solutions?: Json
          level_id: number
          solution: string[]
        }
        Update: {
          alternate_solutions?: Json
          level_id?: number
          solution?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "endgame_solutions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: true
            referencedRelation: "endgame_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_invites: {
        Row: {
          code: string
          consumed_by: string | null
          created_at: string
          expires_at: string
          host_id: string
          id: string
          invited_id: string | null
          match_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          consumed_by?: string | null
          created_at?: string
          expires_at?: string
          host_id: string
          id?: string
          invited_id?: string | null
          match_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          consumed_by?: string | null
          created_at?: string
          expires_at?: string
          host_id?: string
          id?: string
          invited_id?: string | null
          match_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_invites_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_moves: {
        Row: {
          by: string
          clock_b: number
          clock_w: number
          cp: number | null
          created_at: string
          id: number
          match_id: string
          ply: number
          san: string
          seq: number
          uci: string
          zh: string | null
        }
        Insert: {
          by: string
          clock_b: number
          clock_w: number
          cp?: number | null
          created_at?: string
          id?: number
          match_id: string
          ply: number
          san: string
          seq: number
          uci: string
          zh?: string | null
        }
        Update: {
          by?: string
          clock_b?: number
          clock_w?: number
          cp?: number | null
          created_at?: string
          id?: number
          match_id?: string
          ply?: number
          san?: string
          seq?: number
          uci?: string
          zh?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_moves_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          black_elo: number
          black_id: string | null
          black_name: string
          clock_b: number
          clock_w: number
          cp: number
          created_at: string
          fen: string
          id: string
          invite_id: string | null
          last_move_at: string
          outcome: string | null
          ply: number
          rating_delta: number | null
          reason: string | null
          seq: number
          status: string
          tc_base: number
          tc_inc: number
          turn: string
          white_elo: number
          white_id: string | null
          white_name: string
        }
        Insert: {
          black_elo?: number
          black_id?: string | null
          black_name?: string
          clock_b?: number
          clock_w?: number
          cp?: number
          created_at?: string
          fen?: string
          id?: string
          invite_id?: string | null
          last_move_at?: string
          outcome?: string | null
          ply?: number
          rating_delta?: number | null
          reason?: string | null
          seq?: number
          status?: string
          tc_base?: number
          tc_inc?: number
          turn?: string
          white_elo?: number
          white_id?: string | null
          white_name?: string
        }
        Update: {
          black_elo?: number
          black_id?: string | null
          black_name?: string
          clock_b?: number
          clock_w?: number
          cp?: number
          created_at?: string
          fen?: string
          id?: string
          invite_id?: string | null
          last_move_at?: string
          outcome?: string | null
          ply?: number
          rating_delta?: number | null
          reason?: string | null
          seq?: number
          status?: string
          tc_base?: number
          tc_inc?: number
          turn?: string
          white_elo?: number
          white_id?: string | null
          white_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "match_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          diamonds: number
          draws: number
          elo: number
          handle: string
          id: string
          losses: number
          name: string
          streak: number
          updated_at: string
          wins: number
        }
        Insert: {
          created_at?: string
          diamonds?: number
          draws?: number
          elo?: number
          handle: string
          id: string
          losses?: number
          name?: string
          streak?: number
          updated_at?: string
          wins?: number
        }
        Update: {
          created_at?: string
          diamonds?: number
          draws?: number
          elo?: number
          handle?: string
          id?: string
          losses?: number
          name?: string
          streak?: number
          updated_at?: string
          wins?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_ranked_move: {
        Args: {
          p_cp: number
          p_expected_seq: number
          p_fen: string
          p_match_id: string
          p_outcome?: string
          p_reason?: string
          p_san: string
          p_uci: string
          p_user_id: string
          p_zh: string
        }
        Returns: Json
      }
      record_endgame_result: {
        Args: {
          p_correct: boolean
          p_level_id: number
          p_ms: number
          p_user_id: string
        }
        Returns: Json
      }
      search_player_profiles: {
        Args: { q: string }
        Returns: {
          diamonds: number
          draws: number
          elo: number
          handle: string
          id: string
          losses: number
          name: string
          wins: number
        }[]
      }
      settle_ranked_match: {
        Args: { p_match_id: string; p_outcome: string; p_reason: string }
        Returns: Json
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
