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
      cache_queries: {
        Row: {
          query: string
          response: Json
          updated_at: string
        }
        Insert: {
          query: string
          response: Json
          updated_at?: string
        }
        Update: {
          query?: string
          response?: Json
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          added_at: string
          id: string
          media_type: string
          poster_path: string | null
          release_date: string | null
          title: string
          tmdb_id: number
          user_id: string
          vote_average: number | null
        }
        Insert: {
          added_at?: string
          id?: string
          media_type: string
          poster_path?: string | null
          release_date?: string | null
          title: string
          tmdb_id: number
          user_id: string
          vote_average?: number | null
        }
        Update: {
          added_at?: string
          id?: string
          media_type?: string
          poster_path?: string | null
          release_date?: string | null
          title?: string
          tmdb_id?: number
          user_id?: string
          vote_average?: number | null
        }
        Relationships: []
      }
      list_items: {
        Row: {
          added_at: string
          id: string
          list_id: string
          media_type: string
          poster_path: string | null
          release_date: string | null
          title: string
          tmdb_id: number
          vote_average: number | null
        }
        Insert: {
          added_at?: string
          id?: string
          list_id: string
          media_type: string
          poster_path?: string | null
          release_date?: string | null
          title: string
          tmdb_id: number
          vote_average?: number | null
        }
        Update: {
          added_at?: string
          id?: string
          list_id?: string
          media_type?: string
          poster_path?: string | null
          release_date?: string | null
          title?: string
          tmdb_id?: number
          vote_average?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_availability_cache: {
        Row: {
          availability_data: Json
          created_at: string
          id: string
          movie_id: number
          region: string
          tmdb_title: string
          updated_at: string
        }
        Insert: {
          availability_data: Json
          created_at?: string
          id?: string
          movie_id: number
          region?: string
          tmdb_title: string
          updated_at?: string
        }
        Update: {
          availability_data?: Json
          created_at?: string
          id?: string
          movie_id?: number
          region?: string
          tmdb_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      movies_kp: {
        Row: {
          genres: string[] | null
          id: number
          poster: string | null
          premiere_russia: string | null
          rating: number | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          genres?: string[] | null
          id: number
          poster?: string | null
          premiere_russia?: string | null
          rating?: number | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          genres?: string[] | null
          id?: number
          poster?: string | null
          premiere_russia?: string | null
          rating?: number | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      parsed_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          imdb_id: string | null
          is_active: boolean
          movie_id: number
          parsed_at: string
          source_site: string
          title: string
          updated_at: string
          video_links: Json
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          imdb_id?: string | null
          is_active?: boolean
          movie_id: number
          parsed_at?: string
          source_site: string
          title: string
          updated_at?: string
          video_links?: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          imdb_id?: string | null
          is_active?: boolean
          movie_id?: number
          parsed_at?: string
          source_site?: string
          title?: string
          updated_at?: string
          video_links?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
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
