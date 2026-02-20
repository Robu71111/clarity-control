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
  public: {
    Tables: {
      am_activities: {
        Row: {
          action_taken: string
          activity_date: string
          client_id: string
          created_at: string
          employee_id: string
          id: string
          next_step: string | null
          outcome: string | null
        }
        Insert: {
          action_taken: string
          activity_date?: string
          client_id: string
          created_at?: string
          employee_id: string
          id?: string
          next_step?: string | null
          outcome?: string | null
        }
        Update: {
          action_taken?: string
          activity_date?: string
          client_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          next_step?: string | null
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "am_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "am_activities_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bd_prospects: {
        Row: {
          bd_owner_id: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          industry: string | null
          last_follow_up: string | null
          next_action: string | null
          probability: number
          prospect_name: string
          stage: Database["public"]["Enums"]["bd_stage"]
          updated_at: string
        }
        Insert: {
          bd_owner_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          last_follow_up?: string | null
          next_action?: string | null
          probability?: number
          prospect_name: string
          stage?: Database["public"]["Enums"]["bd_stage"]
          updated_at?: string
        }
        Update: {
          bd_owner_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          last_follow_up?: string | null
          next_action?: string | null
          probability?: number
          prospect_name?: string
          stage?: Database["public"]["Enums"]["bd_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bd_prospects_bd_owner_id_fkey"
            columns: ["bd_owner_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_manager_id: string | null
          billing_type: string
          created_at: string
          id: string
          last_payment_date: string | null
          name: string
          outstanding: number
          payment_terms: string
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
        }
        Insert: {
          account_manager_id?: string | null
          billing_type?: string
          created_at?: string
          id?: string
          last_payment_date?: string | null
          name: string
          outstanding?: number
          payment_terms?: string
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Update: {
          account_manager_id?: string | null
          billing_type?: string
          created_at?: string
          id?: string
          last_payment_date?: string | null
          name?: string
          outstanding?: number
          payment_terms?: string
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_kpi_fields: {
        Row: {
          created_at: string
          department: string
          field_name: string
          field_order: number
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          field_name: string
          field_order?: number
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          field_name?: string
          field_order?: number
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      custom_kpi_values: {
        Row: {
          created_at: string
          custom_field_id: string
          employee_id: string
          id: string
          period: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          custom_field_id: string
          employee_id: string
          id?: string
          period: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          custom_field_id?: string
          employee_id?: string
          id?: string
          period?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_kpi_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_kpi_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_kpi_values_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_scores: {
        Row: {
          created_at: string
          discipline: number
          employee_id: string
          final_score: number | null
          id: string
          ownership: number
          productivity: number
          quality: number
          score_month: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discipline?: number
          employee_id: string
          final_score?: number | null
          id?: string
          ownership?: number
          productivity?: number
          quality?: number
          score_month: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discipline?: number
          employee_id?: string
          final_score?: number | null
          id?: string
          ownership?: number
          productivity?: number
          quality?: number
          score_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_scores_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["employee_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          role: Database["public"]["Enums"]["employee_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["employee_role"]
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          billing_month: string
          client_id: string
          created_at: string
          due_date: string | null
          id: string
          invoice_no: string
          sent_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          billing_month: string
          client_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_no: string
          sent_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_month?: string
          client_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_no?: string
          sent_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      job_recruiters: {
        Row: {
          assigned_at: string
          employee_id: string
          id: string
          job_id: string
        }
        Insert: {
          assigned_at?: string
          employee_id: string
          id?: string
          job_id: string
        }
        Update: {
          assigned_at?: string
          employee_id?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_recruiters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_recruiters_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_id: string
          created_at: string
          id: string
          interviews: number
          offers: number
          open_date: string
          priority: Database["public"]["Enums"]["priority_level"]
          starts: number
          status: Database["public"]["Enums"]["job_status"]
          submissions: number
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          interviews?: number
          offers?: number
          open_date?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          starts?: number
          status?: Database["public"]["Enums"]["job_status"]
          submissions?: number
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          interviews?: number
          offers?: number
          open_date?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          starts?: number
          status?: Database["public"]["Enums"]["job_status"]
          submissions?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_targets: {
        Row: {
          created_at: string
          department: string
          id: string
          kpi_name: string
          period: string
          target_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          kpi_name: string
          period?: string
          target_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          kpi_name?: string
          period?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          date_received: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_mode: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          date_received?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_mode?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          date_received?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_activities: {
        Row: {
          activity_date: string
          am_submissions: number
          created_at: string
          employee_id: string
          end_client_submissions: number
          feedback_received: number
          hired: number
          id: string
          interviews_scheduled: number
          job_id: string
          resumes_sourced: number
          submitted: number
        }
        Insert: {
          activity_date?: string
          am_submissions?: number
          created_at?: string
          employee_id: string
          end_client_submissions?: number
          feedback_received?: number
          hired?: number
          id?: string
          interviews_scheduled?: number
          job_id: string
          resumes_sourced?: number
          submitted?: number
        }
        Update: {
          activity_date?: string
          am_submissions?: number
          created_at?: string
          employee_id?: string
          end_client_submissions?: number
          feedback_received?: number
          hired?: number
          id?: string
          interviews_scheduled?: number
          job_id?: string
          resumes_sourced?: number
          submitted?: number
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_activities_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_activities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          department_access: string[] | null
          department_edit_access: string[] | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_access?: string[] | null
          department_edit_access?: string[] | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_access?: string[] | null
          department_edit_access?: string[] | null
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
      get_user_departments: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          _action: string
          _new_values?: Json
          _old_values?: Json
          _record_id?: string
          _table_name?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "account_manager"
        | "recruiter"
        | "business_dev"
        | "operations"
        | "finance"
        | "viewer"
      bd_stage:
        | "Lead"
        | "Contacted"
        | "Meeting Scheduled"
        | "Proposal Sent"
        | "Negotiation"
        | "Closed Won"
        | "Closed Lost"
      client_status: "Active" | "Hold" | "Inactive"
      custom_field_type: "date" | "currency" | "percentage" | "text" | "number"
      employee_role:
        | "Account Manager"
        | "Recruiter"
        | "Business Development"
        | "Operations Manager"
        | "Owner"
      invoice_status: "Draft" | "Sent" | "Paid" | "Overdue"
      job_status:
        | "Open"
        | "On Hold"
        | "Interviewing"
        | "Offer Made"
        | "Filled"
        | "Closed - No Hire"
      priority_level: "High" | "Medium" | "Low"
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
      app_role: [
        "admin",
        "account_manager",
        "recruiter",
        "business_dev",
        "operations",
        "finance",
        "viewer",
      ],
      bd_stage: [
        "Lead",
        "Contacted",
        "Meeting Scheduled",
        "Proposal Sent",
        "Negotiation",
        "Closed Won",
        "Closed Lost",
      ],
      client_status: ["Active", "Hold", "Inactive"],
      custom_field_type: ["date", "currency", "percentage", "text", "number"],
      employee_role: [
        "Account Manager",
        "Recruiter",
        "Business Development",
        "Operations Manager",
        "Owner",
      ],
      invoice_status: ["Draft", "Sent", "Paid", "Overdue"],
      job_status: [
        "Open",
        "On Hold",
        "Interviewing",
        "Offer Made",
        "Filled",
        "Closed - No Hire",
      ],
      priority_level: ["High", "Medium", "Low"],
    },
  },
} as const
