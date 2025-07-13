import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/integrations/github/connect - Connect GitHub account
export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { github_username } = await req.json();

    if (!github_username) {
      return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
    }

    // Check if GitHub integration already exists
    const { data: existingConnection } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("platform_type", "github")
      .single();

    const connectionData = {
      user_id: session.user.id,
      platform_type: "github",
      platform_username: github_username,
      sync_status: "pending",
      auto_sync_enabled: true
    };

    let result;
    if (existingConnection) {
      // Update existing connection
      const { data, error } = await supabase
        .from("connected_platforms")
        .update(connectionData)
        .eq("id", existingConnection.id)
        .select()
        .single();
      result = { data, error };
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from("connected_platforms")
        .insert([connectionData])
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) {
      console.error("Error connecting GitHub:", result.error);
      return NextResponse.json({ error: "Failed to connect GitHub" }, { status: 500 });
    }

    // Trigger initial sync
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: result.data.id })
      });
    } catch (syncError) {
      console.error("Error triggering initial sync:", syncError);
      // Don't fail the connection if sync fails
    }

    return NextResponse.json({ connection: result.data });
  } catch (error) {
    console.error("GitHub connection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}