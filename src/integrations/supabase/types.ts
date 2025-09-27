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
      actors: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_ru: string
          profile_path: string | null
          tmdb_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_ru: string
          profile_path?: string | null
          tmdb_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_ru?: string
          profile_path?: string | null
          tmdb_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
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
      movie_categories: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string
          kinopoisk_url: string | null
          movie_count: number | null
          name: string
          name_en: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          kinopoisk_url?: string | null
          movie_count?: number | null
          name: string
          name_en?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          kinopoisk_url?: string | null
          movie_count?: number | null
          name?: string
          name_en?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      movie_category_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          movie_id: number | null
          position: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          movie_id?: number | null
          position?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          movie_id?: number | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movie_category_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "movie_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_category_items_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies_kp"
            referencedColumns: ["id"]
          },
        ]
      }
      movies_kp: {
        Row: {
          actors: string[] | null
          actors_en: string[] | null
          country: string | null
          country_en: string | null
          description: string | null
          description_en: string | null
          director: string | null
          director_en: string | null
          genres: string[] | null
          genres_en: string[] | null
          id: number
          kinopoisk_id: string | null
          kinopoisk_url: string | null
          last_scraped: string | null
          original_title: string | null
          poster: string | null
          premiere_russia: string | null
          rating: number | null
          streaming_services: Json | null
          title: string
          title_en: string | null
          trailer_url: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          actors?: string[] | null
          actors_en?: string[] | null
          country?: string | null
          country_en?: string | null
          description?: string | null
          description_en?: string | null
          director?: string | null
          director_en?: string | null
          genres?: string[] | null
          genres_en?: string[] | null
          id: number
          kinopoisk_id?: string | null
          kinopoisk_url?: string | null
          last_scraped?: string | null
          original_title?: string | null
          poster?: string | null
          premiere_russia?: string | null
          rating?: number | null
          streaming_services?: Json | null
          title: string
          title_en?: string | null
          trailer_url?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          actors?: string[] | null
          actors_en?: string[] | null
          country?: string | null
          country_en?: string | null
          description?: string | null
          description_en?: string | null
          director?: string | null
          director_en?: string | null
          genres?: string[] | null
          genres_en?: string[] | null
          id?: number
          kinopoisk_id?: string | null
          kinopoisk_url?: string | null
          last_scraped?: string | null
          original_title?: string | null
          poster?: string | null
          premiere_russia?: string | null
          rating?: number | null
          streaming_services?: Json | null
          title?: string
          title_en?: string | null
          trailer_url?: string | null
          updated_at?: string
          year?: number | null
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
      scraping_cache: {
        Row: {
          content: Json
          created_at: string | null
          expires_at: string
          id: string
          updated_at: string | null
          url: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          expires_at: string
          id?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          expires_at?: string
          id?: string
          updated_at?: string | null
          url?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
