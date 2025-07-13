import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/portfolios/[id]/generate - Generate portfolio content from connected platforms
export async function POST(req, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // Get user's connected platforms
    const { data: connections } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("sync_status", "completed");

    if (!connections || connections.length === 0) {
      return NextResponse.json({ error: "No connected platforms found" }, { status: 400 });
    }

    // Generate portfolio content
    const generatedContent = await generatePortfolioContent(connections, session.user);

    // Save projects to database
    const projects = await saveProjectsToPortfolio(supabase, params.id, generatedContent.projects);

    // Update portfolio with generated content
    const { data: updatedPortfolio, error: updateError } = await supabase
      .from("portfolios")
      .update({
        content_data: generatedContent.portfolio,
        last_generated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating portfolio:", updateError);
      return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
    }

    return NextResponse.json({
      portfolio: updatedPortfolio,
      projects: projects,
      generated_content: generatedContent
    });

  } catch (error) {
    console.error("Portfolio generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generatePortfolioContent(connections, user) {
  const content = {
    portfolio: {},
    projects: []
  };

  // Process GitHub connection
  const githubConnection = connections.find(c => c.platform_type === "github");
  if (githubConnection?.platform_data) {
    const githubData = githubConnection.platform_data;
    
    // Generate bio from GitHub profile
    const bio = await generateBioFromGitHub(githubData.profile, githubData.stats);
    
    // Generate professional summary
    const summary = await generateProfessionalSummary(githubData);
    
    // Process repositories into projects
    const projects = await processGitHubRepositories(githubData.repositories);
    
    content.portfolio = {
      bio,
      summary,
      skills: extractSkillsFromGitHub(githubData),
      stats: githubData.stats,
      personal_info: {
        name: githubData.profile.name || user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: githubData.profile.avatar_url || user.user_metadata?.avatar_url,
        location: githubData.profile.location,
        website: githubData.profile.blog,
        github_url: `https://github.com/${githubData.profile.login}`
      }
    };
    
    content.projects = projects;
  }

  return content;
}

async function generateBioFromGitHub(profile, stats) {
  if (!process.env.OPENAI_API_KEY) {
    return profile.bio || "Passionate developer building innovative solutions.";
  }

  const prompt = `Create a professional bio for a developer based on their GitHub profile:

Name: ${profile.name || profile.login}
GitHub Bio: ${profile.bio || "No bio provided"}
Location: ${profile.location || "Not specified"}
Public Repos: ${profile.public_repos}
Followers: ${profile.followers}
Total Stars: ${stats.total_stars}
Top Languages: ${Object.keys(stats.languages).slice(0, 5).join(", ")}

Generate a 2-3 sentence professional bio that highlights their development skills and experience. Keep it engaging and professional.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || profile.bio || "Passionate developer building innovative solutions.";
  } catch (error) {
    console.error("OpenAI bio generation error:", error);
    return profile.bio || "Passionate developer building innovative solutions.";
  }
}

async function generateProfessionalSummary(githubData) {
  if (!process.env.OPENAI_API_KEY) {
    return "Experienced developer with a passion for creating innovative solutions.";
  }

  const prompt = `Create a professional summary for a developer based on their GitHub data:

Repositories: ${githubData.repositories.length}
Total Stars: ${githubData.stats.total_stars}
Top Languages: ${Object.keys(githubData.stats.languages).slice(0, 5).join(", ")}
Most Starred Project: ${githubData.stats.most_starred_repo?.name}

Recent Projects: ${githubData.repositories.slice(0, 3).map(r => r.name).join(", ")}

Generate a 3-4 sentence professional summary highlighting their technical expertise and development experience.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Experienced developer with a passion for creating innovative solutions.";
  } catch (error) {
    console.error("OpenAI summary generation error:", error);
    return "Experienced developer with a passion for creating innovative solutions.";
  }
}

async function processGitHubRepositories(repositories) {
  const projects = [];
  
  // Select top repositories (featured projects)
  const topRepos = repositories
    .filter(repo => !repo.fork || repo.stargazers_count > 0) // Include all original repos, only include forks with stars
    .sort((a, b) => {
      // Enhanced scoring: prioritize original repos, stars, description quality, and recent activity
      const aScore = calculateProjectScore(a);
      const bScore = calculateProjectScore(b);
      return bScore - aScore;
    })
    .slice(0, 8); // Top 8 projects for portfolio

  for (const repo of topRepos) {
    let enhancedDescription = repo.description;
    
    // Enhance description with AI if available
    if (process.env.OPENAI_API_KEY && repo.description) {
      try {
        const prompt = `Enhance this GitHub repository description to be more professional and compelling:

Original: "${repo.description}"
Language: ${repo.language}
Stars: ${repo.stargazers_count}
Topics: ${repo.topics?.join(", ") || "None"}

Rewrite it to highlight the technical achievement and business value. Keep it concise (1-2 sentences).`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100,
          temperature: 0.7,
        });

        enhancedDescription = completion.choices[0]?.message?.content || repo.description;
      } catch (error) {
        console.error("Error enhancing description for", repo.name, error);
      }
    }

    projects.push({
      source_platform: "github",
      source_id: repo.id.toString(),
      title: repo.name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      description: repo.description || "No description provided",
      enhanced_description: enhancedDescription,
      technologies: [
        repo.language,
        ...(repo.topics || [])
      ].filter(Boolean),
      links: {
        github: repo.html_url,
        demo: repo.homepage || null,
        live: repo.has_pages ? `https://${repo.full_name.split('/')[0]}.github.io/${repo.name}` : null
      },
      metrics: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        last_updated: repo.updated_at
      },
      is_featured: topRepos.indexOf(repo) < 4, // Top 4 projects are featured
      display_order: topRepos.indexOf(repo)
    });
  }

  return projects;
}

function extractSkillsFromGitHub(githubData) {
  const skills = new Set();
  
  // Add top languages
  Object.keys(githubData.stats.languages).forEach(lang => {
    skills.add(lang);
  });
  
  // Add topics from repositories
  githubData.repositories.forEach(repo => {
    if (repo.topics) {
      repo.topics.forEach(topic => {
        // Filter for technology-related topics
        if (topic.length > 2 && !topic.includes('-')) {
          skills.add(topic);
        }
      });
    }
  });
  
  return Array.from(skills).slice(0, 20); // Top 20 skills
}

function calculateProjectScore(repo) {
  let score = 0;
  
  // Base score for stars (highly weighted)
  score += repo.stargazers_count * 100;
  
  // Bonus for original repositories (not forks)
  if (!repo.fork) {
    score += 50;
  }
  
  // Bonus for having a good description
  if (repo.description && repo.description.length > 20) {
    score += 30;
  }
  
  // Bonus for having a homepage/demo
  if (repo.homepage) {
    score += 25;
  }
  
  // Bonus for recent activity (within last year)
  const lastUpdated = new Date(repo.updated_at);
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  if (lastUpdated > yearAgo) {
    score += 20;
  }
  
  // Bonus for having topics/tags
  if (repo.topics && repo.topics.length > 0) {
    score += repo.topics.length * 5;
  }
  
  // Bonus for size (indicates substantial project)
  if (repo.size > 1000) {
    score += 15;
  }
  
  // Special bonuses for portfolio-relevant projects
  const name = repo.name.toLowerCase();
  const description = (repo.description || '').toLowerCase();
  
  if (name.includes('portfolio') || description.includes('portfolio')) {
    score += 40;
  }
  
  if (name.includes('app') || name.includes('project') || description.includes('application')) {
    score += 20;
  }
  
  // Penalty for very short names (likely not substantial projects)
  if (repo.name.length < 4) {
    score -= 10;
  }
  
  return score;
}

async function saveProjectsToPortfolio(supabase, portfolioId, projects) {
  // Delete existing projects for this portfolio
  await supabase
    .from("portfolio_projects")
    .delete()
    .eq("portfolio_id", portfolioId);

  // Insert new projects
  const projectsWithPortfolioId = projects.map(project => ({
    ...project,
    portfolio_id: portfolioId
  }));

  const { data: savedProjects, error } = await supabase
    .from("portfolio_projects")
    .insert(projectsWithPortfolioId)
    .select();

  if (error) {
    console.error("Error saving projects:", error);
    throw new Error("Failed to save projects");
  }

  return savedProjects;
}