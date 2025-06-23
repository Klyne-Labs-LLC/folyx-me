
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { fullName, email, company } = await req.json()

    // Validate required fields
    if (!fullName || !email) {
      return new Response(
        JSON.stringify({ error: 'Full name and email are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Insert into waitlist
    const { data, error } = await supabaseClient
      .from('waitlist')
      .insert([
        {
          full_name: fullName,
          email: email.toLowerCase(),
          company: company || null,
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'This email is already on our waitlist!' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to join waitlist. Please try again.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Send confirmation email (you'll need to configure this with your email service)
    try {
      // For now, we'll just log the email that would be sent
      console.log(`Confirmation email would be sent to: ${email}`)
      console.log(`Welcome ${fullName} to the Folyx waitlist!`)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the whole request if email fails
    }

    return new Response(
      JSON.stringify({ 
        message: 'Successfully joined the waitlist!',
        data: data[0]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
