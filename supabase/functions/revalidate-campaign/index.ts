import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { campaign_id } = await req.json();
    
    if (!campaign_id) {
      throw new Error('campaign_id is required');
    }

    console.log('🔄 REVALIDATE: Starting revalidation for campaign', campaign_id);

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or access denied');
    }

    // Fetch brand settings
    const { data: brandSettings, error: settingsError } = await supabaseClient
      .from('brand_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      throw new Error('Error fetching brand settings');
    }

    if (!brandSettings || !brandSettings.brand_book_rules || !brandSettings.validation_strictness) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Brand settings not configured. Please configure your brand book first.',
        requiresConfiguration: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('✅ REVALIDATE: Brand settings found:', {
      brand: brandSettings.brand_name,
      strictness: brandSettings.validation_strictness
    });

    // Prepare content for validation
    const content = {
      shortDescription: campaign.short_description,
      longDescription: campaign.long_description,
      instagram: campaign.instagram
    };

    // Call validate-content function
    const validateResponse = await fetch(`${supabaseUrl}/functions/v1/validate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        content,
        brandSettings,
        campaign_id
      })
    });

    if (!validateResponse.ok) {
      const errorText = await validateResponse.text();
      console.error('❌ REVALIDATE: Validation failed:', errorText);
      throw new Error('Validation service failed');
    }

    const validationData = await validateResponse.json();

    if (validationData.success && validationData.validation) {
      const { score, adjustments } = validationData.validation;
      
      console.log('✅ REVALIDATE: Validation successful:', {
        score,
        adjustments: adjustments?.length || 0
      });

      // Update campaign with new validation results
      const { error: updateError } = await supabaseClient
        .from('campaigns')
        .update({
          brand_compliance_score: score,
          brand_compliance_adjustments: adjustments || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign_id)
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error('Failed to update campaign');
      }

      return new Response(JSON.stringify({
        success: true,
        validation: {
          score,
          adjustments: adjustments || []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid validation response');
    }

  } catch (error) {
    console.error('❌ REVALIDATE: Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
