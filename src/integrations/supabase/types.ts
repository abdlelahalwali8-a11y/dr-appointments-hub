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
      appointment_types: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          cost: number | null
          created_at: string
          created_by: string | null
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          is_return_visit: boolean | null
          notes: string | null
          original_appointment_id: string | null
          patient_id: string
          prescribed_medications: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          treatment: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          is_return_visit?: boolean | null
          notes?: string | null
          original_appointment_id?: string | null
          patient_id: string
          prescribed_medications?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          is_return_visit?: boolean | null
          notes?: string | null
          original_appointment_id?: string | null
          patient_id?: string
          prescribed_medications?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          treatment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_original_appointment_id_fkey"
            columns: ["original_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      center_settings: {
        Row: {
          allow_online_booking: boolean | null
          appointment_duration: number | null
          auto_create_medical_records: boolean | null
          cancellation_hours: number | null
          center_address: string | null
          center_email: string | null
          center_logo_url: string | null
          center_name: string
          center_phone: string | null
          created_at: string
          currency_code: string | null
          currency_name: string | null
          currency_symbol: string | null
          email_notifications_enabled: boolean | null
          emergency_contact_phone: string | null
          enable_sms_reminders: boolean | null
          id: string
          max_advance_booking_days: number | null
          max_appointments_per_day: number | null
          reminder_hours_before: number | null
          require_appointment_confirmation: boolean | null
          show_doctor_availability: boolean | null
          sms_notifications_enabled: boolean | null
          support_email: string | null
          updated_at: string
          whatsapp_notifications_enabled: boolean | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          allow_online_booking?: boolean | null
          appointment_duration?: number | null
          auto_create_medical_records?: boolean | null
          cancellation_hours?: number | null
          center_address?: string | null
          center_email?: string | null
          center_logo_url?: string | null
          center_name?: string
          center_phone?: string | null
          created_at?: string
          currency_code?: string | null
          currency_name?: string | null
          currency_symbol?: string | null
          email_notifications_enabled?: boolean | null
          emergency_contact_phone?: string | null
          enable_sms_reminders?: boolean | null
          id?: string
          max_advance_booking_days?: number | null
          max_appointments_per_day?: number | null
          reminder_hours_before?: number | null
          require_appointment_confirmation?: boolean | null
          show_doctor_availability?: boolean | null
          sms_notifications_enabled?: boolean | null
          support_email?: string | null
          updated_at?: string
          whatsapp_notifications_enabled?: boolean | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          allow_online_booking?: boolean | null
          appointment_duration?: number | null
          auto_create_medical_records?: boolean | null
          cancellation_hours?: number | null
          center_address?: string | null
          center_email?: string | null
          center_logo_url?: string | null
          center_name?: string
          center_phone?: string | null
          created_at?: string
          currency_code?: string | null
          currency_name?: string | null
          currency_symbol?: string | null
          email_notifications_enabled?: boolean | null
          emergency_contact_phone?: string | null
          enable_sms_reminders?: boolean | null
          id?: string
          max_advance_booking_days?: number | null
          max_appointments_per_day?: number | null
          reminder_hours_before?: number | null
          require_appointment_confirmation?: boolean | null
          show_doctor_availability?: boolean | null
          sms_notifications_enabled?: boolean | null
          support_email?: string | null
          updated_at?: string
          whatsapp_notifications_enabled?: boolean | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      diagnosis_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          consultation_fee: number
          created_at: string
          experience_years: number | null
          id: string
          is_available: boolean | null
          license_number: string | null
          return_days: number
          specialization: string
          updated_at: string
          user_id: string
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          bio?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          return_days?: number
          specialization: string
          updated_at?: string
          user_id: string
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          bio?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          return_days?: number
          specialization?: string
          updated_at?: string
          user_id?: string
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appointment_id: string
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          follow_up_instructions: string | null
          id: string
          images_urls: string[] | null
          lab_results: string | null
          patient_id: string
          prescribed_medications: string | null
          treatment_plan: string | null
          updated_at: string
          visit_date: string
          vital_signs: Json | null
        }
        Insert: {
          appointment_id: string
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          follow_up_instructions?: string | null
          id?: string
          images_urls?: string[] | null
          lab_results?: string | null
          patient_id: string
          prescribed_medications?: string | null
          treatment_plan?: string | null
          updated_at?: string
          visit_date: string
          vital_signs?: Json | null
        }
        Update: {
          appointment_id?: string
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          follow_up_instructions?: string | null
          id?: string
          images_urls?: string[] | null
          lab_results?: string | null
          patient_id?: string
          prescribed_medications?: string | null
          treatment_plan?: string | null
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          city: string | null
          created_at: string
          current_medications: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_info: string | null
          medical_history: string | null
          notes: string | null
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          city?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_info?: string | null
          medical_history?: string | null
          notes?: string | null
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          city?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_info?: string | null
          medical_history?: string | null
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      specializations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      treatment_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: { _permission_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      send_notification: {
        Args: {
          _message: string
          _metadata?: Json
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: string
      }
      setup_admin_user: {
        Args: { admin_email: string; admin_full_name?: string }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "waiting"
        | "completed"
        | "return"
        | "cancelled"
      user_role: "admin" | "doctor" | "receptionist" | "patient"
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
      appointment_status: [
        "scheduled",
        "waiting",
        "completed",
        "return",
        "cancelled",
      ],
      user_role: ["admin", "doctor", "receptionist", "patient"],
    },
  },
} as const
