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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      checklist_items: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string | null
          id: string
          title: string
          trip_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          created_at?: string | null
          id?: string
          title: string
          trip_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          id?: string
          title?: string
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          completed_at: string | null
          evidence: string | null
          id: string
          kind: string
          mission_id: string
          org_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          evidence?: string | null
          id?: string
          kind: string
          mission_id: string
          org_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          evidence?: string | null
          id?: string
          kind?: string
          mission_id?: string
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_items_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          destination_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_tips: {
        Row: {
          created_at: string | null
          id: string
          tip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tip_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followed_tips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_7fc9da76: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      landing_signups: {
        Row: {
          created_at: string
          email: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          source?: string | null
        }
        Relationships: []
      }
      lokascore_history: {
        Row: {
          captured_on: string
          destination_key: string
          id: number
          level: string | null
          score: number | null
        }
        Insert: {
          captured_on?: string
          destination_key: string
          id?: never
          level?: string | null
          score?: number | null
        }
        Update: {
          captured_on?: string
          destination_key?: string
          id?: never
          level?: string | null
          score?: number | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          city: string | null
          country_iso: string
          country_name: string
          created_at: string
          created_by: string
          date_end: string
          date_start: string
          destination_id: string | null
          id: string
          org_id: string
          status: string
          traveler_id: string
        }
        Insert: {
          city?: string | null
          country_iso: string
          country_name: string
          created_at?: string
          created_by: string
          date_end: string
          date_start: string
          destination_id?: string | null
          id?: string
          org_id: string
          status?: string
          traveler_id: string
        }
        Update: {
          city?: string | null
          country_iso?: string
          country_name?: string
          created_at?: string
          created_by?: string
          date_end?: string
          date_start?: string
          destination_id?: string | null
          id?: string
          org_id?: string
          status?: string
          traveler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "travelers"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          department_id: string | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_department_fk"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          pilot_ends_at: string | null
          settings: Json
          tier: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          pilot_ends_at?: string | null
          settings?: Json
          tier?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          pilot_ends_at?: string | null
          settings?: Json
          tier?: string
        }
        Relationships: []
      }
      places_cache: {
        Row: {
          created_at: string
          id: string
          payload: Json
          query_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          query_key: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          query_key?: string
        }
        Relationships: []
      }
      preferences: {
        Row: {
          community_allow_messages: boolean | null
          community_visibility: string | null
          created_at: string | null
          id: string
          notif_health: boolean | null
          notif_politics: boolean | null
          notif_security: boolean | null
          notif_transport: boolean | null
          notif_weather: boolean | null
          notifications_enabled: boolean | null
          notifications_radius: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          community_allow_messages?: boolean | null
          community_visibility?: string | null
          created_at?: string | null
          id?: string
          notif_health?: boolean | null
          notif_politics?: boolean | null
          notif_security?: boolean | null
          notif_transport?: boolean | null
          notif_weather?: boolean | null
          notifications_enabled?: boolean | null
          notifications_radius?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          community_allow_messages?: boolean | null
          community_visibility?: string | null
          created_at?: string | null
          id?: string
          notif_health?: boolean | null
          notif_politics?: boolean | null
          notif_security?: boolean | null
          notif_transport?: boolean | null
          notif_weather?: boolean | null
          notifications_enabled?: boolean | null
          notifications_radius?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      travelers: {
        Row: {
          consent_at: string | null
          created_at: string
          department_id: string | null
          email: string | null
          emergency_contact: Json | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          org_id: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          consent_at?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          emergency_contact?: Json | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          org_id: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          consent_at?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          emergency_contact?: Json | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          org_id?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travelers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travelers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_segments: {
        Row: {
          alternatives: Json
          created_at: string | null
          distance_km: number
          duration_min_estimated: number
          from_stop_id: string
          id: string
          metadata: Json | null
          recommended_mode: string
          source: string | null
          to_stop_id: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          alternatives?: Json
          created_at?: string | null
          distance_km: number
          duration_min_estimated: number
          from_stop_id: string
          id?: string
          metadata?: Json | null
          recommended_mode: string
          source?: string | null
          to_stop_id: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          alternatives?: Json
          created_at?: string | null
          distance_km?: number
          duration_min_estimated?: number
          from_stop_id?: string
          id?: string
          metadata?: Json | null
          recommended_mode?: string
          source?: string | null
          to_stop_id?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_segments_from_stop_id_fkey"
            columns: ["from_stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_segments_to_stop_id_fkey"
            columns: ["to_stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_segments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          created_at: string | null
          destination_id: string
          destination_name: string
          end_date: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          order_index: number
          start_date: string | null
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_id: string
          destination_name: string
          end_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          order_index: number
          start_date?: string | null
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_id?: string
          destination_name?: string
          end_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          order_index?: number
          start_date?: string | null
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          active_city_destination_id: string | null
          country_destination_id: string
          created_at: string | null
          destination_id: string
          destination_name: string
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string | null
          traveler_profile: Json | null
          travelers: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_city_destination_id?: string | null
          country_destination_id: string
          created_at?: string | null
          destination_id: string
          destination_name: string
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string | null
          traveler_profile?: Json | null
          travelers?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_city_destination_id?: string | null
          country_destination_id?: string
          created_at?: string | null
          destination_id?: string
          destination_name?: string
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          traveler_profile?: Json | null
          travelers?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_premium: boolean | null
          name: string
          photo: string | null
          premium_expiry: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_premium?: boolean | null
          name: string
          photo?: string | null
          premium_expiry?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          photo?: string | null
          premium_expiry?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_see_department: {
        Args: { p_department: string; p_org: string }
        Returns: boolean
      }
      can_write: { Args: { p_org: string }; Returns: boolean }
      create_organization: {
        Args: { p_name: string; p_tier?: string }
        Returns: string
      }
      is_org_member: { Args: { p_org: string }; Returns: boolean }
      member_department: { Args: { p_org: string }; Returns: string }
      org_role: { Args: { p_org: string }; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
