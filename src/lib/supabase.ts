import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          image: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          image?: string;
          category?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_key: string;
          pet_profile_id: string;
          product_id: string;
          pet_name: string;
          pet_info: string;
          pet_age: string;
          pet_chipped: string;
          pet_vaccinated: string;
          pet_allergies: string;
          pet_medication: string;
          pet_photo: string | null;
          contact_number: string;
          additional_contact: string | null;
          vet_number: string | null;
          product_option: string;
          delivery_full_name: string;
          delivery_address: string;
          delivery_city: string;
          delivery_postal_code: string;
          delivery_phone: string;
          payment_cardholder_name: string;
          payment_expiry_date: string;
          status: string;
          total: number;
          qr_code_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_key: string;
          pet_profile_id: string;
          product_id: string;
          pet_name: string;
          pet_info?: string;
          pet_age: string;
          pet_chipped: string;
          pet_vaccinated: string;
          pet_allergies?: string;
          pet_medication?: string;
          pet_photo?: string | null;
          contact_number: string;
          additional_contact?: string | null;
          vet_number?: string | null;
          product_option: string;
          delivery_full_name: string;
          delivery_address: string;
          delivery_city: string;
          delivery_postal_code: string;
          delivery_phone: string;
          payment_cardholder_name: string;
          payment_expiry_date: string;
          status?: string;
          total: number;
          qr_code_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_key?: string;
          pet_profile_id?: string;
          product_id?: string;
          pet_name?: string;
          pet_info?: string;
          pet_age?: string;
          pet_chipped?: string;
          pet_vaccinated?: string;
          pet_allergies?: string;
          pet_medication?: string;
          pet_photo?: string | null;
          contact_number?: string;
          additional_contact?: string | null;
          vet_number?: string | null;
          product_option?: string;
          delivery_full_name?: string;
          delivery_address?: string;
          delivery_city?: string;
          delivery_postal_code?: string;
          delivery_phone?: string;
          payment_cardholder_name?: string;
          payment_expiry_date?: string;
          status?: string;
          total?: number;
          qr_code_url?: string | null;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          order_key: string;
          username: string | null;
          password_hash: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_key: string;
          username?: string | null;
          password_hash?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_key?: string;
          username?: string | null;
          password_hash?: string | null;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
