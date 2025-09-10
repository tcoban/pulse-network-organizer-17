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
      collaborations: {
        Row: {
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          outcome: string | null
          project_name: string
          start_date: string | null
          success_rating: number | null
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          outcome?: string | null
          project_name: string
          start_date?: string | null
          success_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          outcome?: string | null
          project_name?: string
          start_date?: string | null
          success_rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_preferences: {
        Row: {
          available_times: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          language: string | null
          meeting_location: string | null
          preferred_channel:
            | Database["public"]["Enums"]["preferred_channel"]
            | null
          updated_at: string | null
        }
        Insert: {
          available_times?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          meeting_location?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["preferred_channel"]
            | null
          updated_at?: string | null
        }
        Update: {
          available_times?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          meeting_location?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["preferred_channel"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_preferences_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_social_links: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          platform: string
          url: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          platform: string
          url: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_social_links_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          tag: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          tag: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          added_date: string | null
          affiliation: string | null
          assigned_to: string | null
          avatar: string | null
          company: string | null
          cooperation_rating: number | null
          created_at: string | null
          created_by: string | null
          current_projects: string | null
          email: string
          id: string
          last_contact: string | null
          linkedin_connections: string[] | null
          looking_for: string | null
          mutual_benefit: string | null
          name: string
          notes: string | null
          offering: string | null
          phone: string | null
          position: string | null
          potential_score: number | null
          referred_by: string | null
          updated_at: string | null
        }
        Insert: {
          added_date?: string | null
          affiliation?: string | null
          assigned_to?: string | null
          avatar?: string | null
          company?: string | null
          cooperation_rating?: number | null
          created_at?: string | null
          created_by?: string | null
          current_projects?: string | null
          email: string
          id?: string
          last_contact?: string | null
          linkedin_connections?: string[] | null
          looking_for?: string | null
          mutual_benefit?: string | null
          name: string
          notes?: string | null
          offering?: string | null
          phone?: string | null
          position?: string | null
          potential_score?: number | null
          referred_by?: string | null
          updated_at?: string | null
        }
        Update: {
          added_date?: string | null
          affiliation?: string | null
          assigned_to?: string | null
          avatar?: string | null
          company?: string | null
          cooperation_rating?: number | null
          created_at?: string | null
          created_by?: string | null
          current_projects?: string | null
          email?: string
          id?: string
          last_contact?: string | null
          linkedin_connections?: string[] | null
          looking_for?: string | null
          mutual_benefit?: string | null
          name?: string
          notes?: string | null
          offering?: string | null
          phone?: string | null
          position?: string | null
          potential_score?: number | null
          referred_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_priorities: {
        Row: {
          completed: boolean | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority_type: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority_type: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_priorities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_priorities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participations: {
        Row: {
          contact_id: string | null
          created_at: string | null
          event_date: string
          event_name: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          participation_type: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          event_date: string
          event_name: string
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          participation_type?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          event_date?: string
          event_name?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          participation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          channel: string | null
          contact_id: string | null
          contacted_by: string | null
          created_at: string | null
          date: string
          description: string
          evaluation: string | null
          id: string
          outcome: string | null
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at: string | null
        }
        Insert: {
          channel?: string | null
          contact_id?: string | null
          contacted_by?: string | null
          created_at?: string | null
          date: string
          description: string
          evaluation?: string | null
          id?: string
          outcome?: string | null
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string | null
        }
        Update: {
          channel?: string | null
          contact_id?: string | null
          contacted_by?: string | null
          created_at?: string | null
          date?: string
          description?: string
          evaluation?: string | null
          id?: string
          outcome?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contacted_by_fkey"
            columns: ["contacted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_goals: {
        Row: {
          achieved: boolean | null
          created_at: string | null
          description: string
          id: string
          opportunity_id: string | null
          updated_at: string | null
        }
        Insert: {
          achieved?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          opportunity_id?: string | null
          updated_at?: string | null
        }
        Update: {
          achieved?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          opportunity_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_goals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      network_trends: {
        Row: {
          contacts_mentioned: string[] | null
          created_at: string | null
          date_detected: string | null
          description: string | null
          id: string
          topic: string
          trend_score: number | null
        }
        Insert: {
          contacts_mentioned?: string[] | null
          created_at?: string | null
          date_detected?: string | null
          description?: string | null
          id?: string
          topic: string
          trend_score?: number | null
        }
        Update: {
          contacts_mentioned?: string[] | null
          created_at?: string | null
          date_detected?: string | null
          description?: string | null
          id?: string
          topic?: string
          trend_score?: number | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          contact_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          location: string | null
          registration_status:
            | Database["public"]["Enums"]["registration_status"]
            | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          location?: string | null
          registration_status?:
            | Database["public"]["Enums"]["registration_status"]
            | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          registration_status?:
            | Database["public"]["Enums"]["registration_status"]
            | null
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          event_type: string
          id: string
          importance_level: number | null
          relevant_contacts: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          event_type: string
          id?: string
          importance_level?: number | null
          relevant_contacts?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          event_type?: string
          id?: string
          importance_level?: number | null
          relevant_contacts?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
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
      app_role: "admin" | "user"
      interaction_type:
        | "meeting"
        | "call"
        | "email"
        | "coffee"
        | "event"
        | "other"
      opportunity_type:
        | "event"
        | "meeting"
        | "appointment"
        | "conference"
        | "other"
      preferred_channel:
        | "email"
        | "phone"
        | "linkedin"
        | "in-person"
        | "video-call"
        | "other"
      registration_status: "registered" | "considering" | "confirmed"
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
      app_role: ["admin", "user"],
      interaction_type: [
        "meeting",
        "call",
        "email",
        "coffee",
        "event",
        "other",
      ],
      opportunity_type: [
        "event",
        "meeting",
        "appointment",
        "conference",
        "other",
      ],
      preferred_channel: [
        "email",
        "phone",
        "linkedin",
        "in-person",
        "video-call",
        "other",
      ],
      registration_status: ["registered", "considering", "confirmed"],
    },
  },
} as const
