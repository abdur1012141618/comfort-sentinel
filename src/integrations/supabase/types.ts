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
      alerts: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_open: boolean
          org_id: string | null
          resident_id: string | null
          resolved_at: string | null
          severity: string | null
          source_video_url: string | null
          status: Database["public"]["Enums"]["alert_status"]
          timestamp: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_open?: boolean
          org_id?: string | null
          resident_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          source_video_url?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          timestamp?: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_open?: boolean
          org_id?: string | null
          resident_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          source_video_url?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          timestamp?: string
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "v_residents"
            referencedColumns: ["id"]
          },
        ]
      }
      fall_checks: {
        Row: {
          age: number
          confidence: number
          created_at: string
          gait: string
          history: string
          id: string
          is_fall: boolean
          org_id: string | null
          processed_at: string
          raw: Json | null
          resident_id: string | null
        }
        Insert: {
          age: number
          confidence: number
          created_at?: string
          gait: string
          history: string
          id?: string
          is_fall: boolean
          org_id?: string | null
          processed_at?: string
          raw?: Json | null
          resident_id?: string | null
        }
        Update: {
          age?: number
          confidence?: number
          created_at?: string
          gait?: string
          history?: string
          id?: string
          is_fall?: boolean
          org_id?: string | null
          processed_at?: string
          raw?: Json | null
          resident_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          org_id?: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      residents: {
        Row: {
          created_at: string | null
          created_by: string | null
          dob: string | null
          full_name: string
          gender: string | null
          id: string
          notes: string | null
          org_id: string | null
          room: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dob?: string | null
          full_name: string
          gender?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          room?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dob?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          room?: string | null
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          consent_given: boolean
          given_at: string
          id: string
          policy_version: string
          user_id: string
        }
        Insert: {
          consent_given?: boolean
          given_at?: string
          id?: string
          policy_version: string
          user_id: string
        }
        Update: {
          consent_given?: boolean
          given_at?: string
          id?: string
          policy_version?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_alerts: {
        Row: {
          created_at: string | null
          id: string | null
          org_id: string | null
          resident_id: string | null
          severity: string | null
          status: Database["public"]["Enums"]["alert_status"] | null
          type: Database["public"]["Enums"]["alert_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "v_residents"
            referencedColumns: ["id"]
          },
        ]
      }
      v_fall_checks: {
        Row: {
          age: number | null
          confidence: number | null
          gait: string | null
          history: string | null
          id: string | null
          is_fall: boolean | null
          org_id: string | null
          processed_at: string | null
          raw: Json | null
          resident_id: string | null
        }
        Insert: {
          age?: number | null
          confidence?: number | null
          gait?: string | null
          history?: string | null
          id?: string | null
          is_fall?: boolean | null
          org_id?: string | null
          processed_at?: string | null
          raw?: Json | null
          resident_id?: string | null
        }
        Update: {
          age?: number | null
          confidence?: number | null
          gait?: string | null
          history?: string | null
          id?: string | null
          is_fall?: boolean | null
          org_id?: string | null
          processed_at?: string | null
          raw?: Json | null
          resident_id?: string | null
        }
        Relationships: []
      }
      v_residents: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string | null
          notes: string | null
          org_id: string | null
          room: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      ack_alert: {
        Args: { p_alert_id: string }
        Returns: undefined
      }
      auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      compute_fall_and_alert: {
        Args: { p_age: number; p_gait: string; p_history: string }
        Returns: {
          confidence: number
          is_fall: boolean
          processed_at: string
        }[]
      }
      current_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      ensure_profile: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      resolve_alert: {
        Args: { p_alert_id: string }
        Returns: undefined
      }
    }
    Enums: {
      alert_status: "open" | "ack" | "closed"
      alert_type: "fall" | "pain" | "other"
      severity: "low" | "medium" | "high"
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
      alert_status: ["open", "ack", "closed"],
      alert_type: ["fall", "pain", "other"],
      severity: ["low", "medium", "high"],
    },
  },
} as const
