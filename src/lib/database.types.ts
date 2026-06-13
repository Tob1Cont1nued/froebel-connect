export type Role = 'eltern' | 'fachkraft' | 'traeger';
export type AbsenceStatus = 'pending' | 'confirmed';
export type AppointmentType = 'event' | 'closure' | 'meeting' | 'info';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: Role;
          kita_id: string | null;
          avatar: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      kitas: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kitas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['kitas']['Insert']>;
      };
      children: {
        Row: {
          id: string;
          name: string;
          age: number | null;
          emoji: string;
          photo_url: string | null;
          kita_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['children']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['children']['Insert']>;
      };
      parent_children: {
        Row: { parent_id: string; child_id: string };
        Insert: Database['public']['Tables']['parent_children']['Row'];
        Update: Partial<Database['public']['Tables']['parent_children']['Row']>;
      };
      absences: {
        Row: {
          id: string;
          child_id: string;
          parent_id: string;
          from_date: string;
          to_date: string;
          reason: string;
          note: string | null;
          status: AbsenceStatus;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['absences']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['absences']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          kita_id: string;
          title: string;
          date: string;
          time: string | null;
          type: AppointmentType;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          subject: string | null;
          kita_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      conversation_participants: {
        Row: { conversation_id: string; profile_id: string; unread_count: number };
        Insert: Database['public']['Tables']['conversation_participants']['Row'];
        Update: Partial<Database['public']['Tables']['conversation_participants']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          kita_id: string;
          title: string;
          category: string;
          file_url: string | null;
          size: string | null;
          icon: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      portfolio_entries: {
        Row: {
          id: string;
          child_id: string;
          title: string;
          description: string | null;
          emoji: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['portfolio_entries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['portfolio_entries']['Insert']>;
      };
    };
  };
}
