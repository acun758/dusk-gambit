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
          diamond_reward: number
          elo_required: number
          elo_reward: number
          fen: string
          id: number
          moves_to_mate: number
          name_en: string
          name_zh: string
          objective_en: string
          objective_zh: string
          solution: string[]
        }
        Insert: {
          brief_en: string
          brief_zh: string
          code: string
          diamond_reward?: number
          elo_required?: number
          elo_reward?: number
          fen: string
          id: number
          moves_to_mate?: number
          name_en: string
          name_zh: string
          objective_en: string
          objective_zh: string
          solution: string[]
        }
        Update: {
          brief_en?: string
          brief_zh?: string
          code?: string
          diamond_reward?: number
          elo_required?: number
          elo_reward?: number
          fen?: string
          id?: number
          moves_to_mate?: number
          name_en?: string
          name_zh?: string
          objective_en?: string
          objective_zh?: string
          solution?: string[]
        }
        Relationships: []
      }
      endgame_progress: {
        Row: {
          attempts: number
          best_ms: number | null
          id: string
          level_id: number
          solved: boolean
          solved_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number
          best_ms?: number | null
          id?: string
          level_id: number
          solved?: boolean
          solved_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number
          best_ms?: number | null
          id?: string
          level_id?: number
          solved?: boolean
          solved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "endgame_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "endgame_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endgame_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "endgame_levels_public"
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
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          diamonds: number
          draws: number
          elo: number
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
      endgame_levels_public: {
        Row: {
          brief_en: string | null
          brief_zh: string | null
          code: string | null
          diamond_reward: number | null
          elo_required: number | null
          elo_reward: number | null
          fen: string | null
          id: number | null
          moves_to_mate: number | null
          name_en: string | null
          name_zh: string | null
          objective_en: string | null
          objective_zh: string | null
          solution_length: number | null
        }
        Insert: {
          brief_en?: string | null
          brief_zh?: string | null
          code?: string | null
          diamond_reward?: number | null
          elo_required?: number | null
          elo_reward?: number | null
          fen?: string | null
          id?: number | null
          moves_to_mate?: number | null
          name_en?: string | null
          name_zh?: string | null
          objective_en?: string | null
          objective_zh?: string | null
          solution_length?: never
        }
        Update: {
          brief_en?: string | null
          brief_zh?: string | null
          code?: string | null
          diamond_reward?: number | null
          elo_required?: number | null
          elo_reward?: number | null
          fen?: string | null
          id?: number | null
          moves_to_mate?: number | null
          name_en?: string | null
          name_zh?: string | null
          objective_en?: string | null
          objective_zh?: string | null
          solution_length?: never
        }
        Relationships: []
      }
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
