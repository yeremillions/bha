/**
 * Scheduled Jobs for Brooklyn Hills Apartments
 *
 * These functions should be triggered by a cron job or scheduled task runner
 * (e.g., Supabase Edge Functions, AWS Lambda, or a dedicated job scheduler)
 */

import { supabase } from '@/integrations/supabase/client';
import { sendCheckInReminder } from './emailService';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Send check-in reminders to customers 24 hours before their check-in date
 *
 * Usage: Run this function daily (e.g., at 9:00 AM)
 *
 * @returns Object with success count and errors
 */
export const sendCheckInReminders = async (): Promise<{
  success: number;
  failed: number;
  errors: Array<{ bookingNumber: string; error: string }>;
}> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ bookingNumber: string; error: string }>,
  };

  try {
    // Get tomorrow's date range
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    // Fetch all confirmed bookings with check-in date tomorrow
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, address),
        customer:customers(name, email)
      `)
      .eq('status', 'confirmed')
      .gte('check_in_date', tomorrowStart.toISOString())
      .lte('check_in_date', tomorrowEnd.toISOString());

    if (error) {
      console.error('Error fetching bookings for check-in reminders:', error);
      throw error;
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for tomorrow');
      return results;
    }

    console.log(`Found ${bookings.length} bookings for check-in reminders`);

    // Send email to each customer
    for (const booking of bookings) {
      const customer = booking.customer as any;
      const property = booking.property as any;

      if (!customer?.email) {
        console.warn(`No email found for booking ${booking.booking_number}`);
        results.failed++;
        results.errors.push({
          bookingNumber: booking.booking_number,
          error: 'Customer email not found',
        });
        continue;
      }

      try {
        const result = await sendCheckInReminder(customer.email, {
          bookingNumber: booking.booking_number,
          customerName: customer.name,
          propertyName: property?.name || 'Property',
          checkInDate: format(new Date(booking.check_in_date), 'MMMM d, yyyy'),
          checkInTime: booking.arrival_time || '3:00 PM',
          propertyAddress: property?.address || 'Address on file',
          specialInstructions: booking.special_requests || 'None',
          contactPhone: '+234 803 123 4567', // This should come from settings
        });

        if (result.success) {
          results.success++;
          console.log(`Check-in reminder sent for booking ${booking.booking_number}`);
        } else {
          results.failed++;
          results.errors.push({
            bookingNumber: booking.booking_number,
            error: result.error?.message || 'Unknown error',
          });
          console.error(`Failed to send reminder for booking ${booking.booking_number}:`, result.error);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          bookingNumber: booking.booking_number,
          error: error.message || 'Unknown error',
        });
        console.error(`Error sending reminder for booking ${booking.booking_number}:`, error);
      }
    }

    console.log(`Check-in reminders completed: ${results.success} sent, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error('Fatal error in sendCheckInReminders:', error);
    throw error;
  }
};

/**
 * Example: Set up a cron job to run this daily
 *
 * For Supabase Edge Functions:
 * - Create an edge function that calls this function
 * - Set up a pg_cron job to trigger it daily
 *
 * For external cron (e.g., GitHub Actions, AWS Lambda):
 * - Create an API endpoint that triggers this function
 * - Secure it with an API key
 * - Schedule the cron job to call the endpoint
 */

// Example cron schedule (not actual implementation):
// Daily at 9:00 AM: 0 9 * * *
// Daily at 9:00 AM and 6:00 PM: 0 9,18 * * *
