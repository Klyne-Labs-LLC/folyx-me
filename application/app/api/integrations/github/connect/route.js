import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import GitHubModule from "@/libs/content-fetchers/modules/GitHubModule";

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

    // Initialize GitHub module
    const githubModule = new GitHubModule();

    // Fetch public GitHub data using the username
    const githubResult = await githubModule.fetchPublicUserData(github_username);

    if (!githubResult.success) {
      return NextResponse.json({ 
        error: githubResult.error || "Failed to fetch GitHub data" 
      }, { status: 400 });
    }

    // Check if GitHub integration already exists
    const { data: existingConnection } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("platform", "github")
      .single();

    const connectionData = {
      user_id: session.user.id,
      platform: "github",
      platform_user_id: githubResult.data.profile.id.toString(),
      platform_username: github_username,
      platform_display_name: githubResult.data.profile.name || github_username,
      access_token: "public_access", // Indicates this is public access, not OAuth
      profile_data: githubResult.data.profile,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingConnection) {
      // Update existing connection
      const { data, error } = await supabase
        .from("connected_platforms")
        .update({
          platform_username: github_username,
          platform_display_name: githubResult.data.profile.name || github_username,
          profile_data: githubResult.data.profile,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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

    // Return success with fetched data
    return NextResponse.json({ 
      connection: result.data,
      github_data: {
        profile: githubResult.data.profile,
        repositories_count: githubResult.data.projects?.length || 0,
        total_stars: githubResult.data.portfolioMetrics?.totalStars || 0
      }
    });

  } catch (error) {
    console.error("GitHub connection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}