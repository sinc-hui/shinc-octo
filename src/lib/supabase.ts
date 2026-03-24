import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          encrypted_key: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          encrypted_key?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          encrypted_key?: string | null
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name_encrypted: string
          phone_encrypted: string | null
          email_encrypted: string | null
          title: string | null
          company: string | null
          industry: string | null
          city: string | null
          source: string | null
          tags: string[] | null
          notes_encrypted: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name_encrypted: string
          phone_encrypted?: string | null
          email_encrypted?: string | null
          title?: string | null
          company?: string | null
          industry?: string | null
          city?: string | null
          source?: string | null
          tags?: string[] | null
          notes_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name_encrypted?: string
          phone_encrypted?: string | null
          email_encrypted?: string | null
          title?: string | null
          company?: string | null
          industry?: string | null
          city?: string | null
          source?: string | null
          tags?: string[] | null
          notes_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      records: {
        Row: {
          id: string
          contact_id: string
          type: string
          date: string
          emotion: string | null
          content_encrypted: string
          key_info_encrypted: string | null
          next_step_encrypted: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          type: string
          date: string
          emotion?: string | null
          content_encrypted: string
          key_info_encrypted?: string | null
          next_step_encrypted?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          type?: string
          date?: string
          emotion?: string | null
          content_encrypted?: string
          key_info_encrypted?: string | null
          next_step_encrypted?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          contact_id: string
          content_encrypted: string
          due_date: string | null
          priority: string | null
          done: boolean
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          content_encrypted: string
          due_date?: string | null
          priority?: string | null
          done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          content_encrypted?: string
          due_date?: string | null
          priority?: string | null
          done?: boolean
          created_at?: string
        }
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
  }
}
