import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // If user successfully authenticated, ensure profile exists
    if (data?.user && !error) {
      await ensureUserProfile(supabase, data.user);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}

// Ensure user profile exists in the profiles table
async function ensureUserProfile(supabase, user) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist, create one
    if (!existingProfile && selectError?.code === 'PGRST116') {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        has_access: config.payments.freeAccessMode || false, // Grant free access when payments disabled
        plan_type: 'free',
        onboarding_completed: false
      };

      const { error: insertError } = await supabase
        .from("profiles")
        .insert([profileData]);

      if (insertError) {
        console.error("Error creating user profile:", insertError);
        console.error("Profile data attempted:", profileData);
      } else {
        console.log("Profile created successfully for user:", user.id);
      }
    } else if (selectError && selectError.code !== 'PGRST116') {
      console.error("Error checking for existing profile:", selectError);
    }
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
  }
}
