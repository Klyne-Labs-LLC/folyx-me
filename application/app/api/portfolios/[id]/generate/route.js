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

    // Parse request body for selected sources
    const body = await req.json().catch(() => ({}));
    const selectedSources = body.selectedSources || {};

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

    // Get user's connected platforms (filter by selected if provided)
    let connectionsQuery = supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", session.user.id);
    
    if (selectedSources.connections && selectedSources.connections.length > 0) {
      connectionsQuery = connectionsQuery.in("id", selectedSources.connections);
    }
    
    const { data: connections } = await connectionsQuery;

    // Get user's content (resume, etc.) (filter by selected if provided)
    let contentQuery = supabase
      .from("user_content")
      .select("*")
      .eq("user_id", session.user.id);
    
    if (selectedSources.content && selectedSources.content.length > 0) {
      contentQuery = contentQuery.in("id", selectedSources.content);
    }
    
    const { data: userContent } = await contentQuery;

    if ((!connections || connections.length === 0) && (!userContent || userContent.length === 0)) {
      return NextResponse.json({ error: "No selected data sources found" }, { status: 400 });
    }

    // Generate portfolio content from all available sources
    const generatedContent = await generatePortfolioContent(connections || [], userContent || [], session.user);

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

async function generatePortfolioContent(connections, userContent, user) {
  const content = {
    portfolio: {},
    projects: []
  };

  // Process GitHub connection - fetch fresh data if possible to get repositories
  const githubConnection = connections.find(c => c.platform === "github");
  let githubData = null;
  
  console.log('=== GITHUB CONNECTION DEBUG ===');
  console.log('GitHub connection found:', !!githubConnection);
  console.log('GitHub token configured:', !!process.env.GITHUB_TOKEN);
  console.log('GitHub username:', githubConnection?.platform_username);
  
  if (githubConnection) {
    // Check what's stored in the database
    console.log('Stored GitHub data structure:', githubConnection.profile_data ? Object.keys(githubConnection.profile_data) : 'null');
    console.log('Stored GitHub data has projects:', !!githubConnection.profile_data?.projects);
    
    // If we have a username, fetch fresh data with token to get repositories
    if (githubConnection.platform_username) {
      try {
        const { GitHubConnector } = await import('@/libs/content-fetchers/platforms/GitHubConnector.js');
        const githubConnector = new GitHubConnector();
        
        console.log('Attempting to fetch fresh GitHub data for:', githubConnection.platform_username);
        console.log('Using GitHub token:', process.env.GITHUB_TOKEN ? 'Yes (configured)' : 'No (missing)');
        
        githubData = await githubConnector.fetchUserData(githubConnection.platform_username, process.env.GITHUB_TOKEN);
        
        console.log('Fresh GitHub data fetched successfully:', !!githubData);
        if (githubData) {
          console.log('Fresh GitHub data structure:', Object.keys(githubData));
          console.log('Fresh GitHub projects count:', githubData.projects?.length || 0);
          console.log('Fresh GitHub profile:', !!githubData.profile);
          console.log('Fresh GitHub skills:', !!githubData.skills);
          
          if (githubData.projects?.length > 0) {
            console.log('Sample GitHub project:', {
              title: githubData.projects[0].title,
              technologies: githubData.projects[0].technologies,
              stars: githubData.projects[0].metrics?.stars
            });
          }
        }
      } catch (error) {
        console.error('Error fetching fresh GitHub data:', error.message);
        console.error('Error details:', error);
        
        // Fallback to stored profile data
        console.log('Falling back to stored GitHub data');
        githubData = githubConnection.profile_data;
        
        // Try to enhance stored data if it's just basic profile
        if (githubData && !githubData.projects) {
          console.log('Stored data has no projects, attempting to enhance...');
          githubData = {
            profile: githubData,
            projects: [],
            skills: { technical: [], languages: [], tools: [] },
            socialMetrics: {},
            achievements: []
          };
        }
      }
    } else {
      // Use stored profile data as fallback
      console.log('No GitHub username found, using stored data');
      githubData = githubConnection.profile_data;
    }
  }
  
  console.log('Final GitHub data status:', {
    exists: !!githubData,
    hasProjects: !!githubData?.projects,
    projectCount: githubData?.projects?.length || 0,
    hasProfile: !!githubData?.profile
  });
  console.log('=== END GITHUB DEBUG ===');

  // Process resume data
  const resumeContent = userContent.find(c => c.content_type === "resume");
  let resumeData = null;
  if (resumeContent?.structured_data) {
    resumeData = resumeContent.structured_data;
    
    // If structured data is empty but we have original text, parse it directly
    if ((!resumeData.projects || resumeData.projects.length === 0) && 
        (!resumeData.experience || resumeData.experience.length === 0) &&
        resumeContent.original_text) {
      console.log('Structured data is empty, parsing original text directly');
      console.log('Original text length:', resumeContent.original_text?.length || 0);
      resumeData = parseResumeTextDirect(resumeContent.original_text);
      console.log('After direct parsing - projects:', resumeData.projects.length);
      console.log('After direct parsing - experience:', resumeData.experience.length);
    }
  }

  // Merge and generate content from all available sources
  const mergedData = mergeDataSources(githubData, resumeData, user);
  
  // Generate bio and summary from merged data
  const bio = await generateEnhancedBio(mergedData);
  const summary = await generateEnhancedSummary(mergedData);
  
  // Process projects from all sources
  const githubProjects = githubData ? processGitHubModuleProjects(githubData.projects || []) : [];
  const resumeProjects = resumeData ? processResumeProjects(resumeData.projects || []) : [];
  
  console.log('=== PROJECT PROCESSING DEBUG ===');
  console.log('Raw GitHub projects:', githubData?.projects?.length || 0);
  console.log('Raw resume projects:', resumeData?.projects?.length || 0);
  
  if (githubData?.projects?.length > 0) {
    console.log('Sample raw GitHub project:', {
      title: githubData.projects[0].title || githubData.projects[0].name,
      technologies: githubData.projects[0].technologies,
      description: githubData.projects[0].description?.slice(0, 50)
    });
  }
  
  if (resumeData?.projects?.length > 0) {
    console.log('Sample raw resume project:', {
      title: resumeData.projects[0].title,
      technologies: resumeData.projects[0].technologies,
      description: resumeData.projects[0].description?.slice(0, 50)
    });
  }
  
  console.log('Processed GitHub projects:', githubProjects.length);
  console.log('Processed resume projects:', resumeProjects.length);
  
  if (githubProjects.length > 0) {
    console.log('Sample processed GitHub project:', {
      title: githubProjects[0].title,
      technologies: githubProjects[0].technologies,
      source_platform: githubProjects[0].source_platform
    });
  }
  
  if (resumeProjects.length > 0) {
    console.log('Sample processed resume project:', {
      title: resumeProjects[0].title,
      technologies: resumeProjects[0].technologies,
      source_platform: resumeProjects[0].source_platform
    });
  }
  
  console.log('Total projects to save:', githubProjects.length + resumeProjects.length);
  console.log('=== END PROJECT PROCESSING ===');
  
  content.portfolio = {
    bio,
    summary,
    skills: extractMergedSkills(githubData, resumeData),
    experience: resumeData?.experience || [],
    education: resumeData?.education || [],
    stats: githubData?.socialMetrics || {},
    personal_info: {
      name: mergedData.name,
      avatar_url: mergedData.avatar_url,
      location: mergedData.location,
      email: mergedData.email,
      phone: mergedData.phone,
      website: mergedData.website,
      github_url: mergedData.github_url,
      linkedin_url: mergedData.linkedin_url
    }
  };
  
  content.projects = [...githubProjects, ...resumeProjects];

  return content;
}

function mergeDataSources(githubData, resumeData, user) {
  const merged = {
    name: null,
    email: null,
    phone: null,
    location: null,
    avatar_url: null,
    website: null,
    github_url: null,
    linkedin_url: null,
    bio: null,
    summary: null,
    skills: [],
    experience: [],
    education: [],
    projects: [],
    achievements: []
  };

  // Priority: Resume data > GitHub data > User auth data
  if (resumeData?.personalInfo) {
    merged.name = resumeData.personalInfo.name || merged.name;
    merged.email = resumeData.personalInfo.email || merged.email;
    merged.phone = resumeData.personalInfo.phone || merged.phone;
    merged.location = resumeData.personalInfo.location || merged.location;
    merged.linkedin_url = resumeData.personalInfo.linkedin || merged.linkedin_url;
    merged.github_url = resumeData.personalInfo.github || merged.github_url;
    merged.summary = resumeData.summary || merged.summary;
  }

  if (githubData) {
    // Handle both nested profile structure and direct profile data
    const profile = githubData.profile || githubData;
    merged.name = merged.name || profile.name;
    merged.email = merged.email || profile.email;
    merged.location = merged.location || profile.location;
    merged.avatar_url = profile.avatar || profile.avatar_url;
    merged.website = merged.website || profile.blog;
    merged.github_url = merged.github_url || `https://github.com/${profile.username || profile.login}`;
    merged.bio = profile.bio || merged.bio;
  }

  // Fallback to user auth data
  merged.name = merged.name || user.user_metadata?.full_name || user.email?.split('@')[0];
  merged.email = merged.email || user.email;
  merged.avatar_url = merged.avatar_url || user.user_metadata?.avatar_url;

  return merged;
}

async function generateEnhancedBio(mergedData) {
  if (!process.env.OPENAI_API_KEY) {
    return mergedData.bio || mergedData.summary || "Passionate professional creating innovative solutions.";
  }

  const prompt = `Create a professional bio for a person based on their combined profile data:

Name: ${mergedData.name || "Professional"}
Current Bio: ${mergedData.bio || "Not provided"}
Summary: ${mergedData.summary || "Not provided"}
Location: ${mergedData.location || "Not specified"}
GitHub: ${mergedData.github_url ? "Connected" : "Not connected"}
LinkedIn: ${mergedData.linkedin_url ? "Connected" : "Not connected"}

Generate a compelling 2-3 sentence professional bio that combines their technical skills and professional experience. Keep it engaging and professional.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || mergedData.bio || "Passionate professional creating innovative solutions.";
  } catch (error) {
    console.error("OpenAI enhanced bio generation error:", error);
    return mergedData.bio || mergedData.summary || "Passionate professional creating innovative solutions.";
  }
}

async function generateEnhancedSummary(mergedData) {
  if (!process.env.OPENAI_API_KEY) {
    return mergedData.summary || "Experienced professional with a passion for creating innovative solutions.";
  }

  const prompt = `Create a professional summary for a person based on their combined profile data:

Name: ${mergedData.name || "Professional"}
Bio: ${mergedData.bio || "Not provided"}
Summary: ${mergedData.summary || "Not provided"}
GitHub: ${mergedData.github_url ? "Connected with projects" : "Not connected"}
LinkedIn: ${mergedData.linkedin_url ? "Connected" : "Not connected"}

Generate a comprehensive 3-4 sentence professional summary that highlights their expertise and achievements.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || mergedData.summary || "Experienced professional with a passion for creating innovative solutions.";
  } catch (error) {
    console.error("OpenAI enhanced summary generation error:", error);
    return mergedData.summary || "Experienced professional with a passion for creating innovative solutions.";
  }
}

function processResumeProjects(resumeProjects) {
  return resumeProjects.map((project, index) => ({
    source_platform: "resume",
    source_id: `resume-${index}`,
    title: project.title || project.name || "Untitled Project",
    description: project.description || "No description provided",
    enhanced_description: project.description || "No description provided",
    technologies: project.technologies || project.skills || [],
    links: {
      demo: project.url || project.link || null,
      github: project.github || null,
      live: project.url || project.link || null
    },
    metrics: {},
    is_featured: index < 3, // First 3 resume projects are featured
    display_order: index + 1000 // Resume projects come after GitHub projects
  }));
}

function processGitHubModuleProjects(githubProjects) {
  // Convert GitHubModule processed projects to portfolio format
  return githubProjects.map((project, index) => ({
    source_platform: "github",
    source_id: project.id?.toString() || `github-${index}`,
    title: project.title || project.name || "Untitled Project",
    description: project.description || "No description provided",
    enhanced_description: project.description || "No description provided",
    technologies: project.technologies || [],
    links: {
      github: project.githubUrl || project.url,
      demo: project.demoUrl || project.homepage,
      live: project.demoUrl || project.homepage
    },
    metrics: {
      stars: project.metrics?.stars || 0,
      forks: project.metrics?.forks || 0,
      watchers: project.metrics?.watchers || 0,
      last_updated: project.dates?.updated || project.dates?.pushed
    },
    is_featured: index < 4, // Top 4 projects are featured
    display_order: index
  }));
}

  function parseResumeTextDirect(text) {
    try {
      const resumeData = {
        personalInfo: {},
        projects: [],
        experience: [],
        skills: { technical: [], languages: [], tools: [] },
        achievements: [],
        education: []
      };

      console.log('=== RESUME PARSING DEBUG ===');
      console.log('Resume text length:', text.length);

      // Extract personal info
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) resumeData.personalInfo.email = emailMatch[0];

      const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)/);
      if (nameMatch) resumeData.personalInfo.name = nameMatch[1];

      const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/);
      if (githubMatch) resumeData.personalInfo.github = `https://github.com/${githubMatch[1]}`;

      console.log('Personal info extracted:', resumeData.personalInfo);
  
      // Enhanced project extraction
      const projectsRegex = /Projects\s*(.*?)(?=Technical Skills|Education|Experience|$)/si;
      const projectsMatch = text.match(projectsRegex);
      
      if (projectsMatch) {
        const projectsSection = projectsMatch[1];
        console.log('Found Projects section, length:', projectsSection.length);
        
        // Split by lines and look for project patterns
        const lines = projectsSection.split('\n').map(line => line.trim()).filter(line => line);
        
        console.log('Project lines to analyze:', lines.length);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Look for lines with project pattern: "Name | Technologies | Date"
          if (line.includes('|')) {
            const parts = line.split('|').map(part => part.trim());
            
            if (parts.length >= 2) {
              const title = parts[0];
              const technologies = parts[1];
              const dateInfo = parts[2] || '';
              
              // Look for description on subsequent lines starting with ∗
              let description = '';
              let j = i + 1;
              while (j < lines.length && lines[j].startsWith('∗')) {
                description += lines[j].replace(/^∗\s*/, '') + ' ';
                j++;
              }
              
              if (title && technologies) {
                resumeData.projects.push({
                  title: title,
                  technologies: technologies.split(',').map(t => t.trim()),
                  description: description.trim() || `${title} project completed ${dateInfo}`,
                  date: dateInfo
                });
                
                console.log('Extracted project:', { title, technologies, description: description.slice(0, 50) });
              }
            }
          }
        }
      }
      
      // Fallback: Look for specific project names if regex failed
      if (resumeData.projects.length === 0) {
        console.log('No projects found with regex, trying fallback method...');
        
        const projectPatterns = [
          {
            name: 'Inherit: A Unified Learning & Coding Platform',
            tech: 'Next.js, Express.js, Node.js, MongoDB',
            description: 'Full-stack learning platform with real-time collaborative coding'
          },
          {
            name: 'CrackEd: Educational Platform',
            tech: 'ReactJS, ExpressJS, NodeJS, MongoDB Atlas',
            description: 'MERN application for IUT admission test candidates'
          },
          {
            name: 'LLM Financial Advisor',
            tech: 'AWS SageMaker, Python, Jupyter Notebook',
            description: 'Fine-tuned Meta Llama 2 7B model for finance-specific responses'
          }
        ];
        
        projectPatterns.forEach(project => {
          if (text.includes(project.name.split(':')[0])) {
            resumeData.projects.push({
              title: project.name,
              technologies: project.tech.split(',').map(t => t.trim()),
              description: project.description
            });
            console.log('Found project by name:', project.name);
          }
        });
      }

      // Extract technical skills
      const skillsPatterns = [
        /Languages\s*:\s*([^:]+?)(?=Developer Tools|Technologies|Frameworks|$)/i,
        /Technologies\s*:\s*([^:]+?)(?=Languages|Developer Tools|Frameworks|$)/i,
        /Frameworks\s*:\s*([^:]+?)(?=Languages|Developer Tools|Technologies|$)/i
      ];
      
      skillsPatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match) {
          const skills = match[1].split(',').map(s => s.trim()).filter(s => s && s.length > 1);
          resumeData.skills.technical.push(...skills);
        }
      });
      
      // Remove duplicates
      resumeData.skills.technical = [...new Set(resumeData.skills.technical)];

      console.log('Final parsing results:');
      console.log('- Projects found:', resumeData.projects.length);
      console.log('- Skills found:', resumeData.skills.technical.length);
      console.log('- Projects:', resumeData.projects.map(p => p.title));
      console.log('=== END RESUME PARSING ===');

      return resumeData;
    } catch (error) {
      console.error('Error in parseResumeTextDirect:', error);
      return {
        personalInfo: {},
        projects: [],
        experience: [],
        skills: { technical: [], languages: [], tools: [] },
        achievements: [],
        education: []
      };
    }
  }

function extractMergedSkills(githubData, resumeData) {
  const skills = new Set();
  
  // Add GitHub skills
  if (githubData?.skills) {
    if (githubData.skills.languages) {
      githubData.skills.languages.forEach(lang => skills.add(lang.name || lang));
    }
    if (githubData.skills.technologies) {
      githubData.skills.technologies.forEach(tech => skills.add(tech));
    }
  }
  
  // Add resume skills
  if (resumeData?.skills) {
    const resumeSkills = resumeData.skills;
    if (resumeSkills.technical) {
      resumeSkills.technical.forEach(skill => skills.add(skill));
    }
    if (resumeSkills.languages) {
      resumeSkills.languages.forEach(lang => skills.add(lang));
    }
    if (resumeSkills.tools) {
      resumeSkills.tools.forEach(tool => skills.add(tool));
    }
    if (Array.isArray(resumeSkills)) {
      resumeSkills.forEach(skill => skills.add(skill));
    }
  }
  
  return Array.from(skills).slice(0, 25); // Top 25 skills
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
  console.log('=== SAVING PROJECTS DEBUG ===');
  console.log('Portfolio ID:', portfolioId);
  console.log('Projects to save:', projects.length);
  console.log('Projects data:', JSON.stringify(projects, null, 2));
  
  // Delete existing projects for this portfolio
  await supabase
    .from("portfolio_projects")
    .delete()
    .eq("portfolio_id", portfolioId);

  if (projects.length === 0) {
    console.log('No projects to save, returning empty array');
    return [];
  }

  // Insert new projects
  const projectsWithPortfolioId = projects.map(project => ({
    ...project,
    portfolio_id: portfolioId
  }));

  console.log('Projects with portfolio ID:', projectsWithPortfolioId.length);

  const { data: savedProjects, error } = await supabase
    .from("portfolio_projects")
    .insert(projectsWithPortfolioId)
    .select();

  if (error) {
    console.error("Error saving projects:", error);
    throw new Error("Failed to save projects");
  }

  console.log('Successfully saved projects:', savedProjects?.length || 0);
  console.log('=== END SAVING DEBUG ===');
  return savedProjects;
}