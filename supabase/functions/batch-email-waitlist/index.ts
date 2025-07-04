
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

    // Get all users from waitlist
    const { data: waitlistUsers, error: fetchError } = await supabaseClient
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching waitlist users:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch waitlist users' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    if (!waitlistUsers || waitlistUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users found in waitlist' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Starting batch email send to ${waitlistUsers.length} users`)

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Send email to each user individually
    for (const user of waitlistUsers) {
      try {
        const { full_name, email, company } = user
        
        // Get first name from full name for personalization
        const firstName = full_name.split(' ')[0]
        
        await resend.emails.send({
          from: 'Anian from Folyx<anian@folyx.me>', // Founder's name and email
          to: email,
          subject: `${firstName}, remember signing up for Folyx?`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              
              <p>Hi ${firstName},</p>
              
              <p>You signed up for Folyx a while back (in case you don't remember, yeah, it happens!).</p>
              
              <p>I'm Anian from Folyx. I wanted to personally reach out because we're getting closer to launch and I'm genuinely excited about what we've built.</p>
              
              <p>Quick reminder: Folyx is an AI that automatically maintains your portfolio by syncing with your LinkedIn, GitHub, Medium, and other profiles. No more manual updates when you publish something new or change jobs.</p>
              
              <p>The idea came from my own frustration. Every time I wrote a new article, shipped a project, or updated my LinkedIn, I had to remember to update my portfolio too. Usually, I forgot.</p>
              
              <p>What you'll get when we launch:</p>
              <ul>
                <li>Your portfolio stays current automatically</li>
                <li>Professional design that matches your field</li>
                <li>Works with platforms you already use</li>
                <li>Early access before everyone else</li>
              </ul>
              
              <p>I'll email you personally when we're ready. No spam, just a heads up from me when it's time.</p>
              
              <p>If you have questions or want to chat, feel free to reply to this email - I read and respond to every message personally.</p>
              
              <p>Best,<br>
              Taki Tajwaruzzaman Khan (Anian), Folyx</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                You're receiving this because you signed up for the Folyx waitlist at folyx.me
              </p>
            </div>
          `
        })
        
        successCount++
        console.log(`✅ Email sent successfully to: ${email}`)
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (emailError) {
        errorCount++
        const errorMsg = `Failed to send email to ${user.email}: ${emailError.message}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`Batch email send completed. Success: ${successCount}, Errors: ${errorCount}`)

    return new Response(
      JSON.stringify({ 
        message: 'Batch email send completed',
        totalUsers: waitlistUsers.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
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
