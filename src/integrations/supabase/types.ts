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
          id: string
          org_id: string
          resident_id: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          resident_id: string
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          resident_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
      fall_detection_logs: {
        Row: {
          api_response: Json | null
          created_at: string
          fall_detected: boolean | null
          id: string
          input_data: Json | null
          org_id: string
          resident_id: string | null
        }
        Insert: {
          api_response?: Json | null
          created_at?: string
          fall_detected?: boolean | null
          id?: string
          input_data?: Json | null
          org_id: string
          resident_id?: string | null
        }
        Update: {
          api_response?: Json | null
          created_at?: string
          fall_detected?: boolean | null
          id?: string
          input_data?: Json | null
          org_id?: string
          resident_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fall_detection_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fall_detection_logs_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fall_detection_logs_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "v_residents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          details: string
          id: string
          incident_type: string
          org_id: string
          reported_by: string
          resident_id: string
          resolved_at: string | null
          severity: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          incident_type: string
          org_id: string
          reported_by: string
          resident_id: string
          resolved_at?: string | null
          severity?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          incident_type?: string
          org_id?: string
          reported_by?: string
          resident_id?: string
          resolved_at?: string | null
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "v_residents"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          age: number | null
          created_at: string
          gait: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          room: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          gait?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          room?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          gait?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          room?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          org_id: string
          priority: string
          resident_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          org_id: string
          priority?: string
          resident_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          org_id?: string
          priority?: string
          resident_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "v_residents"
            referencedColumns: ["id"]
          },
        ]
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
          org_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          org_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          org_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          heart_rate: number | null
          id: string
          notes: string | null
          org_id: string
          resident_id: string
          spo2: number | null
          temperature: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          notes?: string | null
          org_id: string
          resident_id: string
          spo2?: number | null
          temperature?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          notes?: string | null
          org_id?: string
          resident_id?: string
          spo2?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "v_residents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_alerts: {
        Row: {
          created_at: string | null
          id: string | null
          org_id: string | null
          resident_id: string | null
          resident_name: string | null
          room: string | null
          severity: string | null
          status: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
          age: number | null
          created_at: string | null
          full_name: string | null
          gait: string | null
          id: string | null
          name: string | null
          notes: string | null
          org_id: string | null
          room: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          full_name?: string | null
          gait?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          org_id?: string | null
          room?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          full_name?: string | null
          gait?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          org_id?: string | null
          room?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      ack_alert: { Args: { p_alert_id: string }; Returns: undefined }
      alerts_resolve: { Args: { p_alert_id: string }; Returns: undefined }
      auth_role: { Args: never; Returns: string }
      calculate_risk_score: { Args: { p_resident_id: string }; Returns: number }
      compute_fall_and_alert: {
        Args: { p_age: number; p_gait: string; p_history: string }
        Returns: {
          confidence: number
          is_fall: boolean
          processed_at: string
        }[]
      }
      current_org_id: { Args: never; Returns: string }
      ensure_profile: { Args: never; Returns: Json }
      get_my_org_id: { Args: never; Returns: string }
      get_org_users_with_roles: {
        Args: never
        Returns: {
          full_name: string
          org_id: string
          role: string
          user_id: string
        }[]
      }
      get_user_org_id: { Args: never; Returns: string }
      is_staff: { Args: never; Returns: boolean }
      resolve_alert: {
        Args: { alert_id_to_resolve: string }
        Returns: undefined
      }
      seed_demo: { Args: { min_rows?: number }; Returns: undefined }
      seed_test_data: { Args: never; Returns: Json }
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
