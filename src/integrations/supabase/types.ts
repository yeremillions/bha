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
      bookings: {
        Row: {
          id: string
          booking_number: string
          property_id: string
          customer_id: string
          check_in_date: string
          check_out_date: string
          nights: number
          num_guests: number
          guest_names: string[]
          base_amount: number
          cleaning_fee: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          status: string
          payment_status: string
          special_requests: string | null
          arrival_time: string | null
          booked_via: string
          source: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          booking_number?: string
          property_id: string
          customer_id: string
          check_in_date: string
          check_out_date: string
          num_guests: number
          guest_names?: string[]
          base_amount: number
          cleaning_fee?: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          status?: string
          payment_status?: string
          special_requests?: string | null
          arrival_time?: string | null
          booked_via?: string
          source?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          booking_number?: string
          property_id?: string
          customer_id?: string
          check_in_date?: string
          check_out_date?: string
          num_guests?: number
          guest_names?: string[]
          base_amount?: number
          cleaning_fee?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          status?: string
          payment_status?: string
          special_requests?: string | null
          arrival_time?: string | null
          booked_via?: string
          source?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          cancellation_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string | null
          whatsapp: string | null
          date_of_birth: string | null
          nationality: string | null
          id_type: string | null
          id_number: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          preferences: Json
          vip_status: boolean
          total_bookings: number
          total_spent: number
          average_rating: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone?: string | null
          whatsapp?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          id_type?: string | null
          id_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          preferences?: Json
          vip_status?: boolean
          total_bookings?: number
          total_spent?: number
          average_rating?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          whatsapp?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          id_type?: string | null
          id_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          preferences?: Json
          vip_status?: boolean
          total_bookings?: number
          total_spent?: number
          average_rating?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      properties: {
        Row: {
          id: string
          name: string
          type: string
          description: string | null
          location: string
          address: string | null
          bedrooms: number
          bathrooms: number
          max_guests: number
          base_price_per_night: number
          cleaning_fee: number
          amenities: string[]
          images: string[]
          status: string
          featured: boolean
          rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          description?: string | null
          location: string
          address?: string | null
          bedrooms: number
          bathrooms: number
          max_guests: number
          base_price_per_night: number
          cleaning_fee?: number
          amenities?: string[]
          images?: string[]
          status?: string
          featured?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          description?: string | null
          location?: string
          address?: string | null
          bedrooms?: number
          bathrooms?: number
          max_guests?: number
          base_price_per_night?: number
          cleaning_fee?: number
          amenities?: string[]
          images?: string[]
          status?: string
          featured?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          booking_id: string | null
          customer_id: string | null
          transaction_type: string
          category: string | null
          amount: number
          payment_method: string | null
          payment_reference: string | null
          status: string
          description: string | null
          metadata: Json
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          customer_id?: string | null
          transaction_type: string
          category?: string | null
          amount: number
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          description?: string | null
          metadata?: Json
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          customer_id?: string | null
          transaction_type?: string
          category?: string | null
          amount?: number
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          description?: string | null
          metadata?: Json
          created_at?: string
          processed_at?: string | null
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
          }
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
      housekeeping_staff: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          email: string | null
          status: string
          rating: number
          total_tasks_completed: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          email?: string | null
          status?: string
          rating?: number
          total_tasks_completed?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          status?: string
          rating?: number
          total_tasks_completed?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          id: string
          task_number: string
          property_id: string
          booking_id: string | null
          task_type: string
          priority: string
          status: string
          assigned_to: string | null
          assigned_at: string | null
          assignment_method: string | null
          scheduled_for: string
          started_at: string | null
          completed_at: string | null
          estimated_duration_minutes: number
          actual_duration_minutes: number | null
          description: string | null
          special_instructions: string | null
          completion_notes: string | null
          checklist: Json
          inspection_required: boolean
          inspection_passed: boolean | null
          inspected_by: string | null
          inspected_at: string | null
          quality_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_number: string
          property_id: string
          booking_id?: string | null
          task_type: string
          priority?: string
          status?: string
          assigned_to?: string | null
          assigned_at?: string | null
          assignment_method?: string | null
          scheduled_for: string
          started_at?: string | null
          completed_at?: string | null
          estimated_duration_minutes?: number
          actual_duration_minutes?: number | null
          description?: string | null
          special_instructions?: string | null
          completion_notes?: string | null
          checklist?: Json
          inspection_required?: boolean
          inspection_passed?: boolean | null
          inspected_by?: string | null
          inspected_at?: string | null
          quality_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_number?: string
          property_id?: string
          booking_id?: string | null
          task_type?: string
          priority?: string
          status?: string
          assigned_to?: string | null
          assigned_at?: string | null
          assignment_method?: string | null
          scheduled_for?: string
          started_at?: string | null
          completed_at?: string | null
          estimated_duration_minutes?: number
          actual_duration_minutes?: number | null
          description?: string | null
          special_instructions?: string | null
          completion_notes?: string | null
          checklist?: Json
          inspection_required?: boolean
          inspection_passed?: boolean | null
          inspected_by?: string | null
          inspected_at?: string | null
          quality_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
            foreignKeyName: "housekeeping_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "housekeeping_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "housekeeping_staff"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_alerts: {
        Row: {
          id: string
          item_id: string
          alert_type: string
          severity: string
          message: string
          is_acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          alert_type: string
          severity: string
          message: string
          is_acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          alert_type?: string
          severity?: string
          message?: string
          is_acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          id: string
          item_code: string
          item_name: string
          category_id: string | null
          description: string | null
          unit_of_measure: string
          current_stock: number
          minimum_stock_level: number
          reorder_level: number
          maximum_stock_level: number | null
          unit_cost: number | null
          selling_price: number | null
          currency: string
          primary_supplier_id: string | null
          storage_location: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_code: string
          item_name: string
          category_id?: string | null
          description?: string | null
          unit_of_measure: string
          current_stock?: number
          minimum_stock_level?: number
          reorder_level?: number
          maximum_stock_level?: number | null
          unit_cost?: number | null
          selling_price?: number | null
          currency?: string
          primary_supplier_id?: string | null
          storage_location?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_code?: string
          item_name?: string
          category_id?: string | null
          description?: string | null
          unit_of_measure?: string
          current_stock?: number
          minimum_stock_level?: number
          reorder_level?: number
          maximum_stock_level?: number | null
          unit_cost?: number | null
          selling_price?: number | null
          currency?: string
          primary_supplier_id?: string | null
          storage_location?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      inventory_purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          item_id: string
          quantity_ordered: number
          quantity_received: number
          unit_cost: number
          total_cost: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          item_id: string
          quantity_ordered: number
          quantity_received?: number
          unit_cost: number
          total_cost: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          item_id?: string
          quantity_ordered?: number
          quantity_received?: number
          unit_cost?: number
          total_cost?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "inventory_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_purchase_orders: {
        Row: {
          id: string
          po_number: string
          supplier_id: string
          order_date: string
          expected_delivery_date: string | null
          actual_delivery_date: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          notes: string | null
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          po_number?: string
          supplier_id: string
          order_date: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          po_number?: string
          supplier_id?: string
          order_date?: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_stock_movements: {
        Row: {
          id: string
          item_id: string
          movement_type: string
          quantity: number
          stock_before: number
          stock_after: number
          reference_number: string | null
          reference_type: string | null
          reference_id: string | null
          supplier_id: string | null
          unit_cost: number | null
          total_cost: number | null
          notes: string | null
          performed_by: string | null
          movement_date: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          movement_type: string
          quantity: number
          stock_before: number
          stock_after: number
          reference_number?: string | null
          reference_type?: string | null
          reference_id?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          total_cost?: number | null
          notes?: string | null
          performed_by?: string | null
          movement_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          movement_type?: string
          quantity?: number
          stock_before?: number
          stock_after?: number
          reference_number?: string | null
          reference_type?: string | null
          reference_id?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          total_cost?: number | null
          notes?: string | null
          performed_by?: string | null
          movement_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      staff: {
        Row: {
          id: string
          employee_id: string
          full_name: string
          email: string | null
          phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          department: string
          position: string
          employment_type: string
          employment_status: string
          date_of_birth: string | null
          hire_date: string
          termination_date: string | null
          base_salary: number | null
          salary_currency: string
          payment_frequency: string
          address: string | null
          city: string | null
          state: string | null
          documents: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string
          full_name: string
          email?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          department: string
          position: string
          employment_type?: string
          employment_status?: string
          date_of_birth?: string | null
          hire_date: string
          termination_date?: string | null
          base_salary?: number | null
          salary_currency?: string
          payment_frequency?: string
          address?: string | null
          city?: string | null
          state?: string | null
          documents?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          department?: string
          position?: string
          employment_type?: string
          employment_status?: string
          date_of_birth?: string | null
          hire_date?: string
          termination_date?: string | null
          base_salary?: number | null
          salary_currency?: string
          payment_frequency?: string
          address?: string | null
          city?: string | null
          state?: string | null
          documents?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          id: string
          staff_id: string
          shift_id: string | null
          attendance_date: string
          clock_in_time: string | null
          clock_out_time: string | null
          status: string
          hours_worked: number | null
          overtime_hours: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          shift_id?: string | null
          attendance_date: string
          clock_in_time?: string | null
          clock_out_time?: string | null
          status: string
          hours_worked?: number | null
          overtime_hours?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          shift_id?: string | null
          attendance_date?: string
          clock_in_time?: string | null
          clock_out_time?: string | null
          status?: string
          hours_worked?: number | null
          overtime_hours?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      staff_leave_requests: {
        Row: {
          id: string
          staff_id: string
          leave_type: string
          start_date: string
          end_date: string
          days_requested: number
          reason: string | null
          status: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          leave_type: string
          start_date: string
          end_date: string
          days_requested: number
          reason?: string | null
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          leave_type?: string
          start_date?: string
          end_date?: string
          days_requested?: number
          reason?: string | null
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      staff_performance_reviews: {
        Row: {
          id: string
          staff_id: string
          review_date: string
          review_period_start: string
          review_period_end: string
          reviewer_id: string | null
          punctuality_rating: number | null
          quality_of_work_rating: number | null
          teamwork_rating: number | null
          communication_rating: number | null
          overall_rating: number | null
          strengths: string | null
          areas_for_improvement: string | null
          goals: string | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          review_date: string
          review_period_start: string
          review_period_end: string
          reviewer_id?: string | null
          punctuality_rating?: number | null
          quality_of_work_rating?: number | null
          teamwork_rating?: number | null
          communication_rating?: number | null
          overall_rating?: number | null
          strengths?: string | null
          areas_for_improvement?: string | null
          goals?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          review_date?: string
          review_period_start?: string
          review_period_end?: string
          reviewer_id?: string | null
          punctuality_rating?: number | null
          quality_of_work_rating?: number | null
          teamwork_rating?: number | null
          communication_rating?: number | null
          overall_rating?: number | null
          strengths?: string | null
          areas_for_improvement?: string | null
          goals?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_performance_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      staff_shifts: {
        Row: {
          id: string
          staff_id: string
          shift_date: string
          shift_type: string
          start_time: string
          end_time: string
          break_duration_minutes: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          shift_date: string
          shift_type: string
          start_time: string
          end_time: string
          break_duration_minutes?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          shift_date?: string
          shift_type?: string
          start_time?: string
          end_time?: string
          break_duration_minutes?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      suppliers: {
        Row: {
          id: string
          supplier_name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          payment_terms: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          payment_terms?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          payment_terms?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
