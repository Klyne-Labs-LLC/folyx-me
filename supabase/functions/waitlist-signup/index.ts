
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

    // Enhanced validation for required fields
    if (!fullName || !email || typeof fullName !== 'string' || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Full name and email are required and must be valid text' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Sanitize and validate full name
    const sanitizedFullName = fullName.trim()
    if (sanitizedFullName.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Full name must be at least 2 characters long' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (sanitizedFullName.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Full name must be less than 50 characters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check for suspicious patterns in name (repeated characters, special characters)
    const repeatedCharPattern = /(.)\1{10,}/; // 10+ repeated characters
    const specialCharPattern = /[{}[\]"\\]/; // Suspicious special characters
    
    if (repeatedCharPattern.test(sanitizedFullName)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid full name' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (specialCharPattern.test(sanitizedFullName)) {
      return new Response(
        JSON.stringify({ error: 'Full name contains invalid characters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Sanitize and validate email
    const sanitizedEmail = email.trim().toLowerCase()
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check for suspicious email patterns
    const suspiciousEmailPatterns = [
      /^null@/,
      /test@test/,
      /sample@/,
      /^\d+@/,
      /@null\./,
      /@test\./
    ];

    if (suspiciousEmailPatterns.some(pattern => pattern.test(sanitizedEmail))) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (sanitizedEmail.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Email address is too long' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate company field if provided
    let sanitizedCompany = null
    if (company && typeof company === 'string') {
      sanitizedCompany = company.trim()
      if (sanitizedCompany.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Company name is too long' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
      // Empty string becomes null
      if (sanitizedCompany === '') {
        sanitizedCompany = null
      }
    }

    // Insert into waitlist with sanitized data
    const { data, error } = await supabaseClient
      .from('waitlist')
      .insert([
        {
          full_name: sanitizedFullName,
          email: sanitizedEmail,
          company: sanitizedCompany,
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
      console.log(`Confirmation email would be sent to: ${sanitizedEmail}`)
      console.log(`Welcome ${sanitizedFullName} to the Folyx waitlist!`)
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
