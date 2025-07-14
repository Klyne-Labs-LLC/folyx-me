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
    console.log('=== GITHUB CONNECTION DEBUG ===');
    console.log('Fetching data for username:', github_username);
    console.log('GitHub token configured:', !!process.env.GITHUB_TOKEN);
    
    const githubResult = await githubModule.fetchPublicUserData(github_username);
    
    console.log('GitHub fetch result:', {
      success: githubResult.success,
      hasData: !!githubResult.data,
      hasProfile: !!githubResult.data?.profile,
      hasProjects: !!githubResult.data?.projects,
      error: githubResult.error
    });
    
    if (githubResult.data?.profile) {
      console.log('Profile data preview:', {
        name: githubResult.data.profile.name,
        public_repos: githubResult.data.profile.public_repos,
        followers: githubResult.data.profile.followers,
        projectsCount: githubResult.data.projects?.length || 0
      });
    }

    if (!githubResult.success) {
      console.error('GitHub fetch failed:', githubResult.error);
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
      profile_data: githubResult.data,
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
          profile_data: githubResult.data,
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

    console.log('=== CONNECTION SAVED SUCCESSFULLY ===');
    console.log('Saved profile data keys:', Object.keys(result.data.profile_data || {}));
    console.log('=== END CONNECTION DEBUG ===');

    // Return success with fetched data
    return NextResponse.json({ 
      connection: result.data,
      github_data: {
        profile: githubResult.data.profile,
        repositories_count: githubResult.data.projects?.length || 0,
        total_stars: githubResult.data.portfolioMetrics?.totalStars || 0,
        // Add more detailed data for the UI
        name: githubResult.data.profile?.name,
        public_repos: githubResult.data.profile?.public_repos || 0,
        followers: githubResult.data.profile?.followers || 0,
        following: githubResult.data.profile?.following || 0
      }
    });

  } catch (error) {
    console.error("GitHub connection error:", error);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages
    if (error.message.includes('rate limit')) {
      return NextResponse.json({ 
        error: "GitHub API rate limit exceeded. Please try again later.",
        details: error.message
      }, { status: 429 });
    }
    
    if (error.message.includes('cookies')) {
      return NextResponse.json({ 
        error: "Session error. Please refresh the page and try again.",
        details: "Authentication context issue"
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to connect GitHub account",
      details: error.message 
    }, { status: 500 });
  }
}