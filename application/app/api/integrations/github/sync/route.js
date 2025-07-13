import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/integrations/github/sync - Sync GitHub data
export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { connection_id } = await req.json();

    if (!connection_id) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });
    }

    // Get connection details
    const { data: connection, error: connectionError } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("id", connection_id)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Update sync status
    await supabase
      .from("connected_platforms")
      .update({ sync_status: "syncing" })
      .eq("id", connection_id);

    try {
      // Fetch GitHub data
      const githubData = await fetchGitHubData(connection.platform_username);
      
      // Store the fetched data
      await supabase
        .from("connected_platforms")
        .update({
          platform_data: githubData,
          last_sync: new Date().toISOString(),
          sync_status: "completed",
          sync_error: null
        })
        .eq("id", connection_id);

      return NextResponse.json({ 
        success: true, 
        repositories_count: githubData.repositories?.length || 0 
      });

    } catch (syncError) {
      console.error("GitHub sync error:", syncError);
      
      // Update error status
      await supabase
        .from("connected_platforms")
        .update({
          sync_status: "error",
          sync_error: syncError.message
        })
        .eq("id", connection_id);

      return NextResponse.json({ error: "Failed to sync GitHub data" }, { status: 500 });
    }

  } catch (error) {
    console.error("GitHub sync route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function fetchGitHubData(username) {
  const baseUrl = "https://api.github.com";
  
  // Fetch user profile
  const profileResponse = await fetch(`${baseUrl}/users/${username}`, {
    headers: {
      "User-Agent": "Folyx-Portfolio-Generator",
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (!profileResponse.ok) {
    throw new Error(`GitHub API error: ${profileResponse.status}`);
  }

  const profile = await profileResponse.json();

  // Fetch repositories
  const reposResponse = await fetch(`${baseUrl}/users/${username}/repos?sort=updated&per_page=100`, {
    headers: {
      "User-Agent": "Folyx-Portfolio-Generator",
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (!reposResponse.ok) {
    throw new Error(`GitHub repos API error: ${reposResponse.status}`);
  }

  const repositories = await reposResponse.json();

  // Filter and process repositories
  const processedRepos = repositories
    .filter(repo => !repo.archived) // Only exclude archived repos, include forks
    .map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      languages_url: repo.languages_url,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      topics: repo.topics || [],
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      size: repo.size,
      default_branch: repo.default_branch,
      is_template: repo.is_template,
      has_wiki: repo.has_wiki,
      has_pages: repo.has_pages
    }))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // Sort by most recently updated

  // Fetch languages for top repositories
  const topRepos = processedRepos.slice(0, 10);
  for (const repo of topRepos) {
    try {
      const langResponse = await fetch(repo.languages_url, {
        headers: {
          "User-Agent": "Folyx-Portfolio-Generator",
          "Accept": "application/vnd.github.v3+json"
        }
      });
      
      if (langResponse.ok) {
        const languages = await langResponse.json();
        repo.languages = languages;
      }
    } catch (error) {
      console.error(`Error fetching languages for ${repo.name}:`, error);
      repo.languages = {};
    }
  }

  return {
    profile: {
      id: profile.id,
      login: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      blog: profile.blog,
      location: profile.location,
      email: profile.email,
      hireable: profile.hireable,
      public_repos: profile.public_repos,
      public_gists: profile.public_gists,
      followers: profile.followers,
      following: profile.following,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    },
    repositories: processedRepos,
    stats: {
      total_repos: processedRepos.length,
      total_stars: processedRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      total_forks: processedRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
      languages: getLanguageStats(processedRepos),
      most_starred_repo: processedRepos.reduce((max, repo) => 
        repo.stargazers_count > (max?.stargazers_count || 0) ? repo : max, null
      )
    },
    fetched_at: new Date().toISOString()
  };
}

function getLanguageStats(repositories) {
  const languageStats = {};
  
  repositories.forEach(repo => {
    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
    }
    
    // Add detailed language stats if available
    if (repo.languages) {
      Object.entries(repo.languages).forEach(([lang, bytes]) => {
        if (!languageStats[lang]) {
          languageStats[lang] = 0;
        }
        languageStats[lang] += bytes;
      });
    }
  });
  
  return Object.entries(languageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10 languages
    .reduce((obj, [lang, count]) => {
      obj[lang] = count;
      return obj;
    }, {});
}