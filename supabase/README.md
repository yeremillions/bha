# Brooklyn Hills Apartments - Database Documentation

## Overview

This directory contains the Supabase database schema, migrations, and seed data for the Brooklyn Hills Apartments property management system.

## Database Structure

### Core Tables

#### 1. **properties**
Stores property listings with details, amenities, and pricing.

**Key Fields:**
- `name` - Property name
- `type` - Studio, Apartment, Penthouse, House, Villa, Loft
- `bedrooms`, `bathrooms`, `max_guests` - Capacity details
- `base_price_per_night` - Base nightly rate
- `amenities` - Array of amenities (security, power, wifi, entertainment, kitchen)
- `status` - available, occupied, maintenance, inactive
- `rating`, `review_count` - Guest feedback metrics

#### 2. **customers**
Guest profiles with booking history and preferences.

**Key Fields:**
- `full_name`, `email`, `phone` - Contact information
- `id_type`, `id_number` - Identification details
- `vip_status` - Automatically set when total_spent >= ₦500,000
- `total_bookings`, `total_spent` - Auto-calculated statistics
- `preferences` - JSON field for dietary requirements, room preferences, etc.

#### 3. **bookings**
Property reservations with dates, pricing, and status tracking.

**Key Fields:**
- `booking_number` - Auto-generated (BK001, BK002, etc.)
- `check_in_date`, `check_out_date` - Reservation dates
- `nights` - Auto-calculated from dates
- `status` - pending, confirmed, checked_in, checked_out, completed, cancelled
- `payment_status` - pending, partial, paid, refunded
- `total_amount` - Must equal base_amount + cleaning_fee + tax_amount - discount_amount

**Constraints:**
- Cannot book property if already occupied for those dates
- Check-out date must be after check-in date
- Total amount calculation enforced at database level

#### 4. **transactions**
Financial transactions for bookings, bar sales, and other charges.

**Key Fields:**
- `transaction_type` - booking, bar_sale, damage_charge, refund, expense, other
- `payment_method` - cash, card, bank_transfer, paystack, other
- `payment_reference` - External payment reference (Paystack, bank, etc.)
- `status` - pending, completed, failed, refunded
- `metadata` - JSON field for additional payment details

### Supporting Tables

#### 5. **settings**
Business configuration stored as key-value pairs (JSON).

**Example Keys:**
- `business_info` - Name, email, phone, address, etc.
- `branding` - Logo, colors
- `booking_config` - Min/max days, check-in/out times
- `payment_config` - Paystack keys, accepted methods
- `cancellation_policy` - Refund rules

#### 6. **seasonal_pricing**
Date-range based pricing multipliers.

**Example:**
- Christmas/New Year: 1.5x multiplier (Dec 24 - Jan 2)
- Easter: 1.3x multiplier
- Low season: 0.8x multiplier

#### 7. **maintenance_issues**
Maintenance work orders and issue tracking.

#### 8. **profiles**
User profiles linked to Supabase auth.

#### 9. **user_roles**
Role-based access control.

**Roles:**
- admin
- facility_manager
- housekeeper
- maintenance
- barman

#### 10. **audit_logs**
Tracks all configuration changes for compliance.

## Migrations

### Running Migrations

All migration files in `supabase/migrations/` are automatically applied in order when deploying to Supabase.

**Current Migrations:**
1. `20251230_*` - Initial user roles and profiles
2. `20260106_*` - Maintenance issues table
3. `20260107015741_*` - Settings, seasonal pricing, audit logs
4. `20260107_create_core_tables.sql` - Properties, customers, bookings, transactions

### Local Development

To apply migrations locally with Supabase CLI:

```bash
# Start local Supabase
supabase start

# Apply all migrations
supabase db reset

# Or apply specific migration
supabase migration up
```

## Seed Data

The `seed.sql` file contains sample data for development and testing.

**Included Data:**
- 6 properties (various types and locations)
- 6 customers (with different profiles)
- 6 bookings (various statuses: confirmed, pending, checked_in, completed, cancelled)
- 5 transactions (payments and one refund)

### Loading Seed Data

**Option 1: Supabase CLI**
```bash
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

**Option 2: Supabase Dashboard**
1. Go to SQL Editor
2. Paste contents of `seed.sql`
3. Run query

**⚠️ Warning:** The seed file truncates tables before inserting data. Do NOT run in production!

## Helper Functions

### `generate_booking_number()`
Auto-generates sequential booking numbers (BK001, BK002, etc.).

```sql
-- Automatically called on INSERT
INSERT INTO bookings (...) VALUES (...);
-- booking_number will be auto-generated
```

### `check_property_availability(property_id, check_in, check_out)`
Checks if a property is available for the given date range.

```sql
-- Example usage
SELECT check_property_availability(
  '11111111-1111-1111-1111-111111111111',
  '2024-12-24',
  '2024-12-27'
);
-- Returns: true or false
```

### `update_customer_stats()`
Automatically updates customer statistics when bookings change.

- Triggers on INSERT or UPDATE to bookings table
- Updates `total_bookings`, `total_spent`, and `vip_status`

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Properties
- ✅ Public can view available/occupied properties
- ✅ Admins/Facility Managers can view all, insert, update
- ✅ Only admins can delete

### Customers
- ✅ Admins/Facility Managers can view all, insert, update
- ✅ Customers can view/update their own profile
- ✅ Only admins can delete

### Bookings
- ✅ Admins/Facility Managers can view all, insert, update
- ✅ Customers can view their own bookings
- ✅ Only admins can delete

### Transactions
- ✅ Admins/Facility Managers can view all, insert, update
- ✅ Customers can view their own transactions
- ✅ Only admins can delete

## Storage Buckets

### property-images
Public bucket for property photos.

**Policies:**
- ✅ Admins/Facility Managers can upload, update, delete
- ✅ Anyone can view (public bucket)

**Usage:**
```typescript
// Upload image
const { data, error } = await supabase.storage
  .from('property-images')
  .upload(`${propertyId}/${filename}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('property-images')
  .getPublicUrl(`${propertyId}/${filename}`);
```

### branding
Public bucket for business branding assets (logo, etc.).

### maintenance-images
Public bucket for maintenance issue photos.

## Indexes

Optimized indexes for common queries:

**Properties:**
- `idx_properties_status` - Fast filtering by status
- `idx_properties_type` - Fast filtering by type
- `idx_properties_featured` - Quick featured property queries

**Customers:**
- `idx_customers_email` - Fast email lookups
- `idx_customers_vip_status` - VIP customer queries

**Bookings:**
- `idx_bookings_property_id` - Property booking history
- `idx_bookings_customer_id` - Customer booking history
- `idx_bookings_date_range` - Availability checks
- `idx_bookings_status` - Status filtering
- `idx_bookings_payment_status` - Payment filtering

**Transactions:**
- `idx_transactions_booking_id` - Booking payment history
- `idx_transactions_created_at` - Time-based queries

## TypeScript Types

The database schema is automatically reflected in TypeScript types at:
`src/integrations/supabase/types.ts`

**Usage:**
```typescript
import { Database, Tables } from '@/integrations/supabase/types';

// Type for a property row
type Property = Tables<'properties'>['Row'];

// Type for inserting a property
type NewProperty = Tables<'properties'>['Insert'];

// Type for updating a property
type PropertyUpdate = Tables<'properties'>['Update'];
```

## Common Queries

### Get Available Properties
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'available')
  .order('featured', { ascending: false });
```

### Check Property Availability
```typescript
const { data: isAvailable } = await supabase
  .rpc('check_property_availability', {
    p_property_id: propertyId,
    p_check_in: '2024-12-24',
    p_check_out: '2024-12-27'
  });
```

### Create Booking with Transaction
```typescript
// Insert booking (booking_number auto-generated)
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    property_id: propertyId,
    customer_id: customerId,
    check_in_date: '2024-12-24',
    check_out_date: '2024-12-27',
    num_guests: 4,
    base_amount: 450000,
    cleaning_fee: 15000,
    tax_amount: 30000,
    total_amount: 495000
  })
  .select()
  .single();

// Create transaction
await supabase
  .from('transactions')
  .insert({
    booking_id: booking.id,
    customer_id: customerId,
    transaction_type: 'booking',
    amount: 495000,
    payment_method: 'paystack',
    status: 'completed'
  });
```

### Get Customer with Bookings
```typescript
const { data: customer } = await supabase
  .from('customers')
  .select(`
    *,
    bookings (
      *,
      properties (name, location)
    )
  `)
  .eq('id', customerId)
  .single();
```

## Backup & Recovery

### Creating Backups

**Supabase Dashboard:**
1. Project Settings → Database
2. Backups → Create backup

**CLI:**
```bash
# Export schema
supabase db dump -f schema.sql

# Export data
supabase db dump --data-only -f data.sql
```

### Restoring from Backup

```bash
# Restore schema
psql -h db.xxx.supabase.co -U postgres -f schema.sql

# Restore data
psql -h db.xxx.supabase.co -U postgres -f data.sql
```

## Performance Tips

1. **Use indexes** - All common query patterns are indexed
2. **Select only needed columns** - Don't use `SELECT *` in production
3. **Use RLS policies** - They're optimized and secure
4. **Batch operations** - Use `upsert` for multiple records
5. **Use computed columns** - `nights` is auto-calculated, don't compute in code

## Troubleshooting

### Migration Errors

**Error: Function update_updated_at_column does not exist**
- Ensure migrations run in order
- The function is created in an earlier migration

**Error: Unique constraint violation on booking_number**
- This shouldn't happen with auto-generation
- Check if you're manually setting booking_number

### RLS Policy Issues

**Error: Row-level security policy violated**
- Ensure user has correct role in `user_roles` table
- Check if `has_role()` function is working
- Verify `auth.uid()` returns correct user ID

## Next Steps

After running migrations and seed data:

1. ✅ Verify tables created: Check Supabase Dashboard → Table Editor
2. ✅ Test RLS policies: Try queries as different user roles
3. ✅ Update frontend to use new tables: Start with Properties page
4. ✅ Implement booking creation workflow
5. ✅ Connect payment processing

## Support

For issues or questions:
- Check Supabase logs in Dashboard
- Review RLS policies if permission errors
- Ensure all migrations applied in correct order
