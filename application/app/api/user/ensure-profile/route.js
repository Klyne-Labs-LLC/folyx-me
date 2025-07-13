import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Ensure user profile exists - create if missing
export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile }, { status: 200 });
    }

    // Create profile if it doesn't exist
    const profileData = {
      id: session.user.id,
      email: session.user.email,
      full_name: session.user.user_metadata?.full_name || 
                 session.user.user_metadata?.name || 
                 session.user.user_metadata?.display_name || 
                 null,
      avatar_url: session.user.user_metadata?.avatar_url || 
                  session.user.user_metadata?.picture || 
                  null,
      has_access: false,
      plan_type: 'free',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single();

    if (insertError) {
      console.error("Profile creation error:", insertError);
      return NextResponse.json({ 
        error: "Failed to create profile", 
        details: insertError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      profile: newProfile, 
      created: true 
    }, { status: 201 });

  } catch (error) {
    console.error("Ensure profile error:", error);
    return NextResponse.json({ 
      error: "Failed to ensure profile exists" 
    }, { status: 500 });
  }
}