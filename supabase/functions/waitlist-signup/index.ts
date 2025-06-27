
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

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

    // Send welcome email using Resend
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
      
      await resend.emails.send({
        from: 'anian@folyx.me', // Replace with your verified domain
        to: sanitizedEmail,
        subject: 'Welcome to Folyx Waitlist! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to Folyx!</h1>
            <p>Hi ${sanitizedFullName},</p>
            <p>Thanks for joining the Folyx waitlist! We're excited to have you on board.</p>
            <p>We're working hard to bring you something amazing. You'll be among the first to know when we launch.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">What's next?</h3>
              <ul>
                <li>We'll keep you updated on our progress</li>
                <li>You'll get early access when we launch</li>
                <li>No spam, just the good stuff!</li>
              </ul>
            </div>
            <p>Best regards,<br>The Folyx Team</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This email was sent because you signed up for the Folyx waitlist.
            </p>
          </div>
        `
      })
      
      console.log(`Welcome email sent successfully to: ${sanitizedEmail}`)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the whole request if email sending fails
      // The user still gets added to the waitlist
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
