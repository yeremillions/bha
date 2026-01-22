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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bar_items: {
        Row: {
          active: boolean | null
          category: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          min_stock_level: number | null
          name: string
          price: number
          stock_quantity: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock_level?: number | null
          name: string
          price: number
          stock_quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock_level?: number | null
          name?: string
          price?: number
          stock_quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bar_tab_items: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          item_id: string
          item_name: string
          notes: string | null
          quantity: number
          tab_id: string
          total: number | null
          unit_price: number
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          item_id: string
          item_name: string
          notes?: string | null
          quantity: number
          tab_id: string
          total?: number | null
          unit_price: number
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          item_id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          tab_id?: string
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bar_tab_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "bar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_tab_items_tab_id_fkey"
            columns: ["tab_id"]
            isOneToOne: false
            referencedRelation: "bar_tabs"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_tabs: {
        Row: {
          booking_id: string | null
          closed_at: string | null
          closed_by: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string
          discount_amount: number | null
          id: string
          notes: string | null
          opened_at: string | null
          opened_by: string | null
          payment_method: string | null
          payment_reference: string | null
          room_number: string | null
          status: string | null
          subtotal: number | null
          tab_number: string
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opened_by?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          room_number?: string | null
          status?: string | null
          subtotal?: number | null
          tab_number: string
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opened_by?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          room_number?: string | null
          status?: string | null
          subtotal?: number | null
          tab_number?: string
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bar_tabs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_tabs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          arrival_time: string | null
          base_amount: number
          booked_via: string | null
          booking_number: string
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          cleaning_fee: number | null
          created_at: string | null
          customer_id: string
          discount_amount: number | null
          guest_names: string[] | null
          id: string
          nights: number | null
          num_guests: number
          payment_status: string | null
          property_id: string
          source: string | null
          special_requests: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          arrival_time?: string | null
          base_amount: number
          booked_via?: string | null
          booking_number: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          cleaning_fee?: number | null
          created_at?: string | null
          customer_id: string
          discount_amount?: number | null
          guest_names?: string[] | null
          id?: string
          nights?: number | null
          num_guests: number
          payment_status?: string | null
          property_id: string
          source?: string | null
          special_requests?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          arrival_time?: string | null
          base_amount?: number
          booked_via?: string | null
          booking_number?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          cleaning_fee?: number | null
          created_at?: string | null
          customer_id?: string
          discount_amount?: number | null
          guest_names?: string[] | null
          id?: string
          nights?: number | null
          num_guests?: number
          payment_status?: string | null
          property_id?: string
          source?: string | null
          special_requests?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          average_rating: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          id: string
          id_number: string | null
          id_type: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          preferences: Json | null
          total_bookings: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
          vip_status: boolean | null
          whatsapp: string | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          vip_status?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          vip_status?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      housekeeping_staff: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          rating: number | null
          status: string
          total_tasks_completed: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          total_tasks_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          total_tasks_completed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          actual_duration_minutes: number | null
          assigned_at: string | null
          assigned_to: string | null
          assignment_method: string | null
          booking_id: string | null
          checklist: Json | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          inspected_at: string | null
          inspected_by: string | null
          inspection_passed: boolean | null
          inspection_required: boolean | null
          priority: string
          property_id: string
          quality_rating: number | null
          scheduled_for: string
          special_instructions: string | null
          started_at: string | null
          status: string
          task_number: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          assigned_at?: string | null
          assigned_to?: string | null
          assignment_method?: string | null
          booking_id?: string | null
          checklist?: Json | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          inspection_passed?: boolean | null
          inspection_required?: boolean | null
          priority?: string
          property_id: string
          quality_rating?: number | null
          scheduled_for: string
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          task_number: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          assigned_at?: string | null
          assigned_to?: string | null
          assignment_method?: string | null
          booking_id?: string | null
          checklist?: Json | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          inspection_passed?: boolean | null
          inspection_required?: boolean | null
          priority?: string
          property_id?: string
          quality_rating?: number | null
          scheduled_for?: string
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          task_number?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "housekeeping_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          id: string
          is_acknowledged: boolean | null
          item_id: string
          message: string
          severity: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          item_id: string
          message: string
          severity: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          item_id?: string
          message?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          currency: string | null
          current_stock: number
          description: string | null
          id: string
          item_code: string
          item_name: string
          maximum_stock_level: number | null
          minimum_stock_level: number
          notes: string | null
          primary_supplier_id: string | null
          reorder_level: number
          selling_price: number | null
          status: string
          storage_location: string | null
          unit_cost: number | null
          unit_of_measure: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          item_code: string
          item_name: string
          maximum_stock_level?: number | null
          minimum_stock_level?: number
          notes?: string | null
          primary_supplier_id?: string | null
          reorder_level?: number
          selling_price?: number | null
          status?: string
          storage_location?: string | null
          unit_cost?: number | null
          unit_of_measure: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          item_code?: string
          item_name?: string
          maximum_stock_level?: number | null
          minimum_stock_level?: number
          notes?: string | null
          primary_supplier_id?: string | null
          reorder_level?: number
          selling_price?: number | null
          status?: string
          storage_location?: string | null
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_primary_supplier_id_fkey"
            columns: ["primary_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          notes: string | null
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          notes?: string | null
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "inventory_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date: string
          po_number: string
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock_movements: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          movement_date: string | null
          movement_type: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          stock_after: number
          stock_before: number
          supplier_id: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          movement_date?: string | null
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          stock_after: number
          stock_before: number
          supplier_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          movement_date?: string | null
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          supplier_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_issues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_urls: string[] | null
          issue_type: string
          location: string | null
          priority: string
          property: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          issue_type: string
          location?: string | null
          priority?: string
          property: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          issue_type?: string
          location?: string | null
          priority?: string
          property?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          base_price_per_night: number
          bathrooms: number
          bedrooms: number
          cleaning_fee: number | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          location: string
          max_guests: number
          name: string
          rating: number | null
          review_count: number | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          base_price_per_night: number
          bathrooms: number
          bedrooms: number
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location: string
          max_guests: number
          name: string
          rating?: number | null
          review_count?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          base_price_per_night?: number
          bathrooms?: number
          bedrooms?: number
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string
          max_guests?: number
          name?: string
          rating?: number | null
          review_count?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seasonal_pricing: {
        Row: {
          active: boolean
          created_at: string
          end_date: string
          id: string
          multiplier: number
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_date: string
          id?: string
          multiplier?: number
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_date?: string
          id?: string
          multiplier?: number
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          base_salary: number | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          department: string
          documents: Json | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string
          employment_status: string
          employment_type: string
          full_name: string
          hire_date: string
          id: string
          notes: string | null
          payment_frequency: string | null
          phone: string | null
          position: string
          salary_currency: string | null
          state: string | null
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          base_salary?: number | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department: string
          documents?: Json | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id: string
          employment_status?: string
          employment_type?: string
          full_name: string
          hire_date: string
          id?: string
          notes?: string | null
          payment_frequency?: string | null
          phone?: string | null
          position: string
          salary_currency?: string | null
          state?: string | null
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          base_salary?: number | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string
          documents?: Json | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string
          employment_status?: string
          employment_type?: string
          full_name?: string
          hire_date?: string
          id?: string
          notes?: string | null
          payment_frequency?: string | null
          phone?: string | null
          position?: string
          salary_currency?: string | null
          state?: string | null
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          attendance_date: string
          clock_in_time: string | null
          clock_out_time: string | null
          created_at: string | null
          hours_worked: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          shift_id: string | null
          staff_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          clock_in_time?: string | null
          clock_out_time?: string | null
          created_at?: string | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          shift_id?: string | null
          staff_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          clock_in_time?: string | null
          clock_out_time?: string | null
          created_at?: string | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          shift_id?: string | null
          staff_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "staff_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_requested: number
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          rejection_reason: string | null
          staff_id: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_requested: number
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          rejection_reason?: string | null
          staff_id: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_requested?: number
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          rejection_reason?: string | null
          staff_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_performance_reviews: {
        Row: {
          areas_for_improvement: string | null
          comments: string | null
          communication_rating: number | null
          created_at: string | null
          goals: string | null
          id: string
          overall_rating: number | null
          punctuality_rating: number | null
          quality_of_work_rating: number | null
          review_date: string
          review_period_end: string
          review_period_start: string
          reviewer_id: string | null
          staff_id: string
          strengths: string | null
          teamwork_rating: number | null
          updated_at: string | null
        }
        Insert: {
          areas_for_improvement?: string | null
          comments?: string | null
          communication_rating?: number | null
          created_at?: string | null
          goals?: string | null
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          quality_of_work_rating?: number | null
          review_date: string
          review_period_end: string
          review_period_start: string
          reviewer_id?: string | null
          staff_id: string
          strengths?: string | null
          teamwork_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          areas_for_improvement?: string | null
          comments?: string | null
          communication_rating?: number | null
          created_at?: string | null
          goals?: string | null
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          quality_of_work_rating?: number | null
          review_date?: string
          review_period_end?: string
          review_period_start?: string
          reviewer_id?: string | null
          staff_id?: string
          strengths?: string | null
          teamwork_rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_performance_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_shifts: {
        Row: {
          break_duration_minutes: number | null
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          staff_id: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          shift_type: string
          staff_id: string
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          staff_id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          state: string | null
          status: string
          supplier_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          supplier_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          supplier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          department: string
          email: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string | null
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          department?: string
          email: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          department?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          category: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          processed_at: string | null
          status: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          status?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          status?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          department: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_jobs: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string
          estimated_cost: number | null
          estimated_hours: number | null
          feedback: string | null
          id: string
          images: string[] | null
          invoice_number: string | null
          job_number: string
          labor_cost: number | null
          maintenance_issue_id: string | null
          notes: string | null
          parts_cost: number | null
          payment_date: string | null
          payment_status: string | null
          priority: string | null
          property_id: string | null
          rating: number | null
          scheduled_date: string | null
          scheduled_time: string | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          feedback?: string | null
          id?: string
          images?: string[] | null
          invoice_number?: string | null
          job_number: string
          labor_cost?: number | null
          maintenance_issue_id?: string | null
          notes?: string | null
          parts_cost?: number | null
          payment_date?: string | null
          payment_status?: string | null
          priority?: string | null
          property_id?: string | null
          rating?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          feedback?: string | null
          id?: string
          images?: string[] | null
          invoice_number?: string | null
          job_number?: string
          labor_cost?: number | null
          maintenance_issue_id?: string | null
          notes?: string | null
          parts_cost?: number | null
          payment_date?: string | null
          payment_status?: string | null
          priority?: string | null
          property_id?: string | null
          rating?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_jobs_maintenance_issue_id_fkey"
            columns: ["maintenance_issue_id"]
            isOneToOne: false
            referencedRelation: "maintenance_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_jobs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          active: boolean | null
          address: string | null
          company_name: string | null
          completed_jobs: number | null
          created_at: string | null
          email: string | null
          emergency_contact: boolean | null
          hourly_rate: number | null
          id: string
          insurance_verified: boolean | null
          license_number: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          specialty: string
          total_jobs: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          company_name?: string | null
          completed_jobs?: number | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: boolean | null
          hourly_rate?: number | null
          id?: string
          insurance_verified?: boolean | null
          license_number?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          specialty: string
          total_jobs?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          company_name?: string | null
          completed_jobs?: number | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: boolean | null
          hourly_rate?: number | null
          id?: string
          insurance_verified?: boolean | null
          license_number?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          specialty?: string
          total_jobs?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_housekeeping_task: {
        Args: { task_id: string }
        Returns: string
      }
      check_property_availability: {
        Args: { p_check_in: string; p_check_out: string; p_property_id: string }
        Returns: boolean
      }
      generate_booking_number: { Args: never; Returns: string }
      generate_employee_id: { Args: never; Returns: string }
      generate_item_code: { Args: { category_name: string }; Returns: string }
      generate_po_number: { Args: never; Returns: string }
      generate_tab_number: { Args: never; Returns: string }
      generate_task_number: { Args: never; Returns: string }
      generate_vendor_job_number: { Args: never; Returns: string }
      get_low_stock_items: {
        Args: never
        Returns: {
          category: string
          difference: number
          id: string
          min_stock_level: number
          name: string
          stock_quantity: number
        }[]
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
      app_role:
        | "admin"
        | "housekeeper"
        | "maintenance"
        | "barman"
        | "facility_manager"
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
        "housekeeper",
        "maintenance",
        "barman",
        "facility_manager",
      ],
    },
  },
} as const
