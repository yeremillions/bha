import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Strict Access Control
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        // STRICT EMAIL CHECK
        if (user.email !== 'yeremibolton@gmail.com') {
            console.warn(`Unauthorized reset attempt by: ${user.email}`);
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Insufficient privileges' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('Reset initiated by:', user.email);

        // 2. Perform Data Reset (Order matters for foreign keys)

        // Inventory & Purchasing
        await supabaseClient.from('inventory_purchase_order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        await supabaseClient.from('inventory_purchase_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('inventory_alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Reset Inventory Stock
        await supabaseClient.from('inventory_items').update({ current_stock: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('bar_items').update({ stock_quantity: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');

        // Operations (Transactions, Tabs, Tasks)
        await supabaseClient.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('bar_tab_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('bar_tabs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('housekeeping_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Bookings (Delete last to avoid FK issues with above tables)
        await supabaseClient.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Reset Stats
        await supabaseClient.from('customers').update({ total_bookings: 0, total_spent: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('housekeeping_staff').update({ total_tasks_completed: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Log Action
        await supabaseClient.from('audit_logs').insert({
            user_id: user.id,
            user_email: user.email,
            action: 'system.reset',
            details: 'Performed full system data reset (Bookings, Inventory, Stats)',
        });

        return new Response(
            JSON.stringify({ success: true, message: 'System data reset successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error resetting system data:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
